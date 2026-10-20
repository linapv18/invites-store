begin;
-- Enable full discounts without altering existing codes, orders or customers.
alter table public.discount_codes drop constraint if exists discount_codes_percent_off_check;
alter table public.discount_codes add constraint discount_codes_percent_off_check check(percent_off between 1 and 100);
create or replace function public.discount_quote(verified_owner uuid, requested_design text, requested_currency text, requested_code text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare dc public.discount_codes; p public.products; tier text; normalized text; used integer; unit bigint; off bigint; minimum bigint;
begin
 normalized:=upper(btrim(coalesce(requested_code,'')));
 if normalized !~ '^[A-Z0-9]{3,32}$' then raise exception 'DISCOUNT_NOT_FOUND'; end if;
 if requested_currency not in ('COP','USD') or requested_currency is null then raise exception 'INVALID_CURRENCY'; end if;
 select * into dc from public.discount_codes where code=normalized;
 if not found or not dc.active then raise exception 'DISCOUNT_NOT_FOUND'; end if;
 if dc.starts_at is not null and now()<dc.starts_at then raise exception 'DISCOUNT_NOT_STARTED'; end if;
 if dc.ends_at is not null and now()>=dc.ends_at then raise exception 'DISCOUNT_EXPIRED'; end if;
 select t.tier into tier from public.design_price_tiers t where t.design_id=requested_design;
 if tier is null or not (tier = any(dc.tiers)) then raise exception 'DISCOUNT_NOT_APPLICABLE'; end if;
 if dc.max_uses is not null then
  select count(*) into used from public.orders o where o.discount_code_id=dc.id and o.status in ('paid','pending');
  if used>=dc.max_uses then raise exception 'DISCOUNT_EXHAUSTED'; end if;
 end if;
 if dc.once_per_customer and exists(select 1 from public.orders o where o.discount_code_id=dc.id and o.owner_id=verified_owner and o.status in ('paid','pending')) then raise exception 'DISCOUNT_ALREADY_USED'; end if;
 select * into p from public.products where sku='invitation-'||requested_design||'-'||lower(requested_currency) and active;
 if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
 unit:=case when requested_currency='COP' then 100 else 1 end;
 minimum:=case when requested_currency='COP' then 500000 else 100 end;
 off:=case when dc.kind='percent' then (p.price_minor*dc.percent_off/100/unit)*unit
  else case when requested_currency='COP' then dc.amount_off_cop else dc.amount_off_usd end end;
 off:=(off/unit)*unit;
 if off<=0 then raise exception 'DISCOUNT_NOT_APPLICABLE'; end if;
 if dc.kind='percent' and dc.percent_off=100 then off:=p.price_minor; end if;
 if p.price_minor-off<minimum and not (dc.kind='percent' and dc.percent_off=100) then raise exception 'DISCOUNT_TOO_LARGE'; end if;
 return jsonb_build_object('code',dc.code,'discount_code_id',dc.id,'kind',dc.kind,'percent_off',dc.percent_off,'currency',requested_currency,'base_minor',p.price_minor,'discount_minor',off,'total_minor',p.price_minor-off);
end; $$;
revoke all on function public.discount_quote(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.discount_quote(uuid,text,text,text) to service_role;

create or replace function public.apply_verified_payment(payment_provider text,provider_event text,target_order uuid,external_payment text,verified_amount bigint,verified_currency text) returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.orders; item public.order_items; existing public.payment_events; recorded public.payments;
begin
 if length(trim(coalesce(payment_provider,''))) not between 1 and 64 or length(trim(coalesce(provider_event,''))) not between 1 and 255 then raise exception 'INVALID_PAYMENT_EVENT'; end if;
 select * into purchase from public.orders where id=target_order for update;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 if verified_amount is null or verified_currency is null or purchase.total_minor<>verified_amount or purchase.currency<>verified_currency then raise exception 'PAYMENT_AMOUNT_MISMATCH'; end if;
 if verified_amount=0 and not exists(select 1 from public.discount_codes dc where dc.id=purchase.discount_code_id and dc.kind='percent' and dc.percent_off=100 and purchase.discount_minor>0) then raise exception 'INVALID_FREE_ORDER'; end if;
 if not exists(select 1 from public.invitations i where i.id=purchase.invitation_id and i.owner_id=purchase.owner_id) then raise exception 'ORDER_OWNER_MISMATCH'; end if;
 if not exists(select 1 from public.order_items oi where oi.order_id=target_order) or (select sum(oi.unit_price_minor*oi.quantity) from public.order_items oi where oi.order_id=target_order)-purchase.discount_minor<>purchase.total_minor then raise exception 'ORDER_TOTAL_MISMATCH'; end if;
 select * into existing from public.payment_events where provider=payment_provider and event_id=provider_event;
 if found then
  if existing.order_id<>target_order or not exists(select 1 from public.payments p where p.order_id=target_order and p.provider=payment_provider and p.provider_payment_id=external_payment) then raise exception 'PAYMENT_EVENT_REUSED'; end if;
  return jsonb_build_object('order_id',target_order,'status',purchase.status,'duplicate',true);
 end if;
 if purchase.status not in ('pending','paid') then raise exception 'ORDER_NOT_PAYABLE'; end if;
 select * into recorded from public.payments where order_id=target_order;
 if found and (recorded.provider<>payment_provider or recorded.provider_payment_id<>external_payment) then raise exception 'ORDER_ALREADY_PAID'; end if;
 for item in select * from public.order_items where order_id=target_order loop
  if item.design_id is not null and not exists(select 1 from public.invitations i where i.id=purchase.invitation_id and i.design_id=item.design_id) then raise exception 'ORDER_DESIGN_MISMATCH'; end if;
 end loop;
 insert into public.payment_events(provider,event_id,order_id) values(payment_provider,provider_event,target_order);
 insert into public.payments(order_id,provider,provider_payment_id,amount_minor,currency) values(target_order,payment_provider,external_payment,verified_amount,verified_currency) on conflict(order_id) do nothing;
 -- A duplicate notification for an already paid order must not reactivate revoked rights.
 if purchase.status='pending' then
  update public.orders set status='paid' where id=target_order;
  for item in select * from public.order_items where order_id=target_order loop
   if item.design_id is not null then
    insert into public.invitation_entitlements(invitation_id,source,order_item_id,expires_at) values(purchase.invitation_id,'purchase',item.id,purchase.access_expires_at)
    on conflict(invitation_id) do update set source='purchase',order_item_id=excluded.order_item_id,reason='',granted_at=now(),expires_at=excluded.expires_at,revoked_at=null;
   else
    insert into public.addon_entitlements(invitation_id,addon_code,order_item_id) values(purchase.invitation_id,item.addon_code,item.id)
    on conflict(invitation_id,addon_code) do update set order_item_id=excluded.order_item_id,granted_at=now(),revoked_at=null;
   end if;
  end loop;
 end if;
 return jsonb_build_object('order_id',target_order,'status','paid','duplicate',false);
end; $$;
revoke all on function public.apply_verified_payment(text,text,uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.apply_verified_payment(text,text,uuid,text,bigint,text) to service_role;

commit;
