begin;
-- A private bucket: knowing a file path does not grant permission to download it.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('invitation-assets','invitation-assets',false,15728640,array['image/jpeg','image/png','image/webp','image/avif','audio/mpeg']);
create function public.owns_asset_path(path text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and length(path)<=200 and array_length(string_to_array(path,'/'),1)=3 and split_part(path,'/',1)=auth.uid()::text
 and split_part(path,'/',3) ~ '^[a-f0-9-]{36}\.(jpg|jpeg|png|webp|avif|mp3)$'
 and exists(select 1 from public.invitations i where i.id::text=split_part(path,'/',2) and i.owner_id=auth.uid());
$$;
revoke all on function public.owns_asset_path(text) from public,anon;
grant execute on function public.owns_asset_path(text) to authenticated;
create policy invitation_file_upload on storage.objects for insert to authenticated with check(bucket_id='invitation-assets' and public.owns_asset_path(name));
create policy invitation_file_read on storage.objects for select to authenticated using(bucket_id='invitation-assets' and public.owns_asset_path(name));
-- No UPDATE policy: published files cannot be silently replaced at the same path.
create policy invitation_file_delete on storage.objects for delete to authenticated using(bucket_id='invitation-assets' and public.owns_asset_path(name) and not exists(select 1 from public.invitation_assets a join public.publication_assets pa on pa.asset_id=a.id where a.object_path=name));
create function public.register_invitation_asset(target uuid,path text,asset_kind text) returns public.invitation_assets language plpgsql security definer set search_path='' as $$
declare obj storage.objects; result public.invitation_assets;
begin
 if not public.owns_invitation(target) or not public.owns_asset_path(path) or split_part(path,'/',2)<>target::text then raise exception 'ASSET_NOT_OWNED'; end if;
 select * into obj from storage.objects where bucket_id='invitation-assets' and name=path;
 if not found then raise exception 'FILE_NOT_UPLOADED'; end if;
 insert into public.invitation_assets(invitation_id,object_path,kind,mime_type,size_bytes) values(target,path,asset_kind,obj.metadata->>'mimetype',(obj.metadata->>'size')::bigint)
 on conflict(object_path) do nothing;
 select * into result from public.invitation_assets where object_path=path;
 return result;
end; $$;
revoke all on function public.register_invitation_asset(uuid,text,text) from public,anon;
grant execute on function public.register_invitation_asset(uuid,text,text) to authenticated;

-- The trusted checkout server passes a verified owner and product IDs, never a client price.
create function public.create_checkout_order(verified_owner uuid,target_invitation uuid,requested_products uuid[],checkout_request uuid,publication_until timestamptz default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.orders; product public.products; inv public.invitations; money text; amount bigint:=0; bases integer:=0;
begin
 if verified_owner is null or checkout_request is null or coalesce(cardinality(requested_products),0) not between 1 and 20 or (select count(distinct p) from unnest(requested_products) p)<>cardinality(requested_products) then raise exception 'INVALID_CHECKOUT'; end if;
 select * into inv from public.invitations where id=target_invitation and owner_id=verified_owner for update;
 if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
 select * into purchase from public.orders where checkout_request_id=checkout_request;
 if found then
  if purchase.owner_id<>verified_owner or purchase.invitation_id<>target_invitation or purchase.access_expires_at is distinct from publication_until or (select array_agg(oi.product_id order by oi.product_id) from public.order_items oi where oi.order_id=purchase.id) is distinct from (select array_agg(p order by p) from unnest(requested_products) p) then raise exception 'CHECKOUT_REQUEST_REUSED'; end if;
  return jsonb_build_object('id',purchase.id,'amount_minor',purchase.total_minor,'currency',purchase.currency,'status',purchase.status);
 end if;
 if publication_until is not null and publication_until<=now() then raise exception 'INVALID_EXPIRY'; end if;
 if (select count(*) from public.products p where p.id=any(requested_products) and p.active)<>cardinality(requested_products) then raise exception 'PRODUCT_UNAVAILABLE'; end if;
 for product in select * from public.products where id=any(requested_products) order by id for share loop
  if money is null then money:=product.currency; end if;
  if product.currency<>money then raise exception 'MIXED_CURRENCIES'; end if;
  if product.design_id is not null then
   bases:=bases+1;
   if product.design_id<>inv.design_id then raise exception 'ORDER_DESIGN_MISMATCH'; end if;
  end if;
  amount:=amount+product.price_minor;
 end loop;
 if bases>1 or (bases=0 and not public.invitation_is_enabled(target_invitation)) then raise exception 'BASE_PRODUCT_REQUIRED'; end if;
 insert into public.orders(owner_id,invitation_id,checkout_request_id,total_minor,currency,access_expires_at) values(verified_owner,target_invitation,checkout_request,amount,money,publication_until) returning * into purchase;
 insert into public.order_items(order_id,product_id,design_id,addon_code,unit_price_minor)
 select purchase.id,p.id,p.design_id,p.addon_code,p.price_minor from public.products p where p.id=any(requested_products);
 return jsonb_build_object('id',purchase.id,'amount_minor',purchase.total_minor,'currency',purchase.currency,'status',purchase.status);
end; $$;
revoke all on function public.create_checkout_order(uuid,uuid,uuid[],uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.create_checkout_order(uuid,uuid,uuid[],uuid,timestamptz) to service_role;

-- This is the database half of a verified webhook, NOT a payment provider endpoint.
-- Only a trusted server may call it AFTER validating the provider's signature and event.
create function public.apply_verified_payment(payment_provider text,provider_event text,target_order uuid,external_payment text,verified_amount bigint,verified_currency text) returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.orders; item public.order_items; existing public.payment_events; recorded public.payments;
begin
 if length(trim(coalesce(payment_provider,''))) not between 1 and 64 or length(trim(coalesce(provider_event,''))) not between 1 and 255 then raise exception 'INVALID_PAYMENT_EVENT'; end if;
 select * into purchase from public.orders where id=target_order for update;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 if verified_amount is null or verified_currency is null or purchase.total_minor<>verified_amount or purchase.currency<>verified_currency then raise exception 'PAYMENT_AMOUNT_MISMATCH'; end if;
 if not exists(select 1 from public.invitations i where i.id=purchase.invitation_id and i.owner_id=purchase.owner_id) then raise exception 'ORDER_OWNER_MISMATCH'; end if;
 if not exists(select 1 from public.order_items oi where oi.order_id=target_order) or (select sum(oi.unit_price_minor*oi.quantity) from public.order_items oi where oi.order_id=target_order)<>purchase.total_minor then raise exception 'ORDER_TOTAL_MISMATCH'; end if;
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

-- Records an externally verified refund/revocation; it does not issue money refunds.
create function public.revoke_order_access(target_order uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.orders where id=target_order and status in ('paid','refunded') for update;
 if not found then raise exception 'PAID_ORDER_NOT_FOUND'; end if;
 update public.orders set status='refunded' where id=target_order;
 update public.invitation_entitlements set revoked_at=now() where order_item_id in(select id from public.order_items where order_id=target_order);
 update public.addon_entitlements set revoked_at=now() where order_item_id in(select id from public.order_items where order_id=target_order);
end; $$;
revoke all on function public.revoke_order_access(uuid) from public,anon,authenticated;
grant execute on function public.revoke_order_access(uuid) to service_role;
commit;
