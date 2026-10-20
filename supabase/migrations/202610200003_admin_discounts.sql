-- Panel de administración y códigos de descuento.
-- Se puede ejecutar de nuevo sin efectos: crea lo que falta y reemplaza funciones.
-- Requiere 202610200002_tier_prices.sql. Los códigos son de Invitesse (no de Stripe): la orden se crea ya con el precio rebajado, Stripe cobra
-- exactamente ese total y apply_verified_payment acepta «precio de los productos − descuento validado».
-- Las funciones admin_* solo las puede llamar el servidor (service_role); api/admin.js verifica antes
-- que la sesión pertenezca a una cuenta autorizada (ADMIN_EMAILS).
begin;

-- La gama de cada diseño viene de public.design_price_tiers (202610200002_tier_prices.sql).
create table if not exists public.discount_codes (
 id uuid primary key default gen_random_uuid(),
 code text not null unique check (code ~ '^[A-Z0-9]{3,32}$'),
 kind text not null check (kind in ('percent','amount')),
 percent_off integer check (percent_off between 1 and 90),
 amount_off_cop bigint check (amount_off_cop > 0),
 amount_off_usd bigint check (amount_off_usd > 0),
 tiers text[] not null default array['esencial','signature','luxury']::text[] check (cardinality(tiers) between 1 and 3 and tiers <@ array['esencial','signature','luxury']::text[]),
 max_uses integer check (max_uses is null or max_uses >= 1),
 once_per_customer boolean not null default false,
 starts_at timestamptz,
 ends_at timestamptz,
 active boolean not null default true,
 note text not null default '' check (length(note) <= 300),
 created_at timestamptz not null default now(),
 check ((kind='percent' and percent_off is not null and amount_off_cop is null and amount_off_usd is null) or (kind='amount' and percent_off is null and amount_off_cop is not null and amount_off_usd is not null)),
 check (ends_at is null or starts_at is null or ends_at > starts_at)
);
alter table public.discount_codes enable row level security;
revoke all on public.discount_codes from public,anon,authenticated;
grant all on public.discount_codes to service_role;

alter table public.orders add column if not exists discount_code_id uuid references public.discount_codes(id);
alter table public.orders add column if not exists discount_minor bigint not null default 0 check (discount_minor >= 0);

-- Valida un código para un diseño y una moneda y calcula el descuento sobre el precio vigente.
-- COP se redondea a pesos enteros (múltiplos de 100 en unidades menores). El total nunca baja del mínimo.
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
 if p.price_minor-off<minimum then raise exception 'DISCOUNT_TOO_LARGE'; end if;
 return jsonb_build_object('code',dc.code,'discount_code_id',dc.id,'kind',dc.kind,'percent_off',dc.percent_off,'currency',requested_currency,'base_minor',p.price_minor,'discount_minor',off,'total_minor',p.price_minor-off);
end; $$;
revoke all on function public.discount_quote(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.discount_quote(uuid,text,text,text) to service_role;

-- prepare_stripe_checkout con código opcional. La versión de 4 argumentos se reemplaza: las llamadas sin
-- código siguen funcionando igual (requested_code toma su valor por defecto).
drop function if exists public.prepare_stripe_checkout(uuid,text,text,integer);
create or replace function public.prepare_stripe_checkout(verified_owner uuid, requested_design text, requested_currency text, expected_revision integer, requested_code text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.invitation_drafts; i public.invitations; o public.orders; c public.stripe_checkouts; p public.products; day date; zone text; expiry timestamptz; result jsonb; discount jsonb; total bigint;
begin
 if requested_currency not in ('COP','USD') or requested_currency is null then raise exception 'INVALID_CURRENCY'; end if;
 select * into d from public.invitation_drafts where owner_id=verified_owner and design_id=requested_design for update;
 if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
 select * into i from public.invitations where id=d.id for update;
 if not found then raise exception 'PLATFORM_NOT_READY'; end if;
 if not exists(select 1 from auth.users where id=verified_owner and email_confirmed_at is not null) then raise exception 'EMAIL_NOT_CONFIRMED'; end if;
 if public.invitation_is_enabled(i.id) then return jsonb_build_object('status','enabled','invitation_id',i.id,'created_at',o.created_at); end if;
 -- A paid, expired or revoked invitation must never be charged again through retry.
 if exists(select 1 from public.orders where invitation_id=i.id and status in ('paid','refunded')) then raise exception 'PURCHASE_ALREADY_EXISTS'; end if;
 if expected_revision is null or expected_revision<>d.revision then raise exception 'DRAFT_CONFLICT'; end if;
 if coalesce(d.content->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'EVENT_DETAILS_REQUIRED'; end if;
 day:=(d.content->>'date')::date;
 zone:=coalesce(nullif(d.content->>'timeZone',''),'America/Bogota');
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=zone) then raise exception 'INVALID_TIME_ZONE'; end if;
 if day<(now() at time zone zone)::date then raise exception 'EVENT_DATE_IN_PAST'; end if;
 -- Exclusive end of the expiry date in the event's time zone, calendar month arithmetic.
 expiry:=((day+interval '3 months'+interval '1 day')::timestamp at time zone zone);
 select orders.* into o from public.orders orders join public.stripe_checkouts s on s.order_id=orders.id where orders.invitation_id=i.id and orders.status='pending' order by orders.created_at desc limit 1;
 if found then
  -- A pending checkout keeps the price (and code) the buyer already accepted.
  select * into c from public.stripe_checkouts where order_id=o.id;
  return jsonb_build_object('status','pending','order_id',o.id,'amount',o.total_minor,'currency',o.currency,'event_date',c.event_date,'timezone',c.event_timezone,'expires_at',o.access_expires_at,'session_id',c.session_id,'invitation_id',i.id,'created_at',o.created_at,'discount_minor',o.discount_minor,'discount_code',(select code from public.discount_codes where id=o.discount_code_id));
 end if;
 select * into p from public.products where sku='invitation-'||requested_design||'-'||lower(requested_currency) and active;
 if not found or p.price_minor is distinct from public.invitation_price_minor(requested_design,requested_currency) then raise exception 'PRODUCT_UNAVAILABLE'; end if;
 if nullif(btrim(coalesce(requested_code,'')),'') is not null then
  discount:=public.discount_quote(verified_owner,requested_design,requested_currency,requested_code);
 end if;
 result:=public.create_checkout_order(verified_owner,i.id,array[p.id],gen_random_uuid(),expiry);
 total:=(result->>'amount_minor')::bigint;
 if discount is not null then
  total:=total-(discount->>'discount_minor')::bigint;
  update public.orders set total_minor=total,discount_minor=(discount->>'discount_minor')::bigint,discount_code_id=(discount->>'discount_code_id')::uuid where id=(result->>'id')::uuid;
 end if;
 insert into public.stripe_checkouts(order_id,invitation_id,event_date,event_timezone) values((result->>'id')::uuid,i.id,day,zone);
 return jsonb_build_object('status','pending','order_id',result->>'id','amount',total,'currency',result->>'currency','event_date',day,'timezone',zone,'expires_at',expiry,'session_id',null,'invitation_id',i.id,'created_at',now(),'discount_minor',coalesce((discount->>'discount_minor')::bigint,0),'discount_code',discount->>'code');
end; $$;
revoke all on function public.prepare_stripe_checkout(uuid,text,text,integer,text) from public,anon,authenticated;
grant execute on function public.prepare_stripe_checkout(uuid,text,text,integer,text) to service_role;

-- Igual que antes, salvo una línea: el total pagado debe ser la suma de los productos menos el descuento
-- que el servidor validó al crear la orden (discount_minor), nunca un monto que diga el navegador.
create or replace function public.apply_verified_payment(payment_provider text,provider_event text,target_order uuid,external_payment text,verified_amount bigint,verified_currency text) returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.orders; item public.order_items; existing public.payment_events; recorded public.payments;
begin
 if length(trim(coalesce(payment_provider,''))) not between 1 and 64 or length(trim(coalesce(provider_event,''))) not between 1 and 255 then raise exception 'INVALID_PAYMENT_EVENT'; end if;
 select * into purchase from public.orders where id=target_order for update;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 if verified_amount is null or verified_currency is null or purchase.total_minor<>verified_amount or purchase.currency<>verified_currency then raise exception 'PAYMENT_AMOUNT_MISMATCH'; end if;
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

-- ======================= Lecturas del panel (solo service_role) =======================
-- Una fila de orden con lo que el panel muestra: pareja (del borrador), correo, diseño, gama, código y pago.
create or replace function public.admin_order_row(o public.orders) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'id',o.id,'created_at',o.created_at,'status',o.status,'currency',o.currency,'total_minor',o.total_minor,'discount_minor',o.discount_minor,
  'code',(select dc.code from public.discount_codes dc where dc.id=o.discount_code_id),
  'email',(select u.email from auth.users u where u.id=o.owner_id),
  'n1',d.content->>'n1','n2',d.content->>'n2','design',i.design_id,'tier',(select t.tier from public.design_price_tiers t where t.design_id=i.design_id),
  'invitation_state',i.state,'slug',i.slug,
  'event_date',(select s.event_date from public.stripe_checkouts s where s.order_id=o.id),
  'paid_at',(select p.verified_at from public.payments p where p.order_id=o.id),
  'responses',(select count(*) from public.guest_responses gr join public.guests g on g.id=gr.guest_id join public.households h on h.id=g.household_id where h.invitation_id=i.id))
 from public.invitations i left join public.invitation_drafts d on d.id=i.id where i.id=o.invitation_id;
$$;
revoke all on function public.admin_order_row(public.orders) from public,anon,authenticated;
grant execute on function public.admin_order_row(public.orders) to service_role;

create or replace function public.admin_orders(filter jsonb default '{}'::jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare st text:=nullif(filter->>'status',''); cur text:=nullif(filter->>'currency',''); ti text:=nullif(filter->>'tier',''); q text:=nullif(btrim(coalesce(filter->>'q','')),'');
 lim integer:=least(greatest(coalesce((filter->>'limit')::integer,25),1),100); off integer:=greatest(coalesce((filter->>'offset')::integer,0),0); rows jsonb; total integer; counts jsonb;
begin
 with base as (
  select o, public.admin_order_row(o) r from public.orders o
  where (cur is null or o.currency=cur)
 ), filtered as (
  select * from base where (ti is null or r->>'tier'=ti)
   and (q is null or coalesce(r->>'email','') ilike '%'||q||'%' or coalesce(r->>'n1','') ilike '%'||q||'%' or coalesce(r->>'n2','') ilike '%'||q||'%' or (r->>'id') ilike q||'%' or coalesce(r->>'code','') ilike q)
 )
 select (select count(*) from filtered where st is null or (o).status=st),
  (select coalesce(jsonb_agg(r order by (o).created_at desc),'[]'::jsonb) from (select * from filtered where st is null or (o).status=st order by (o).created_at desc limit lim offset off) page),
  (select jsonb_build_object('all',count(*),'paid',count(*) filter (where (o).status='paid'),'pending',count(*) filter (where (o).status='pending'),'refunded',count(*) filter (where (o).status='refunded'),'cancelled',count(*) filter (where (o).status='cancelled')) from filtered)
 into total,rows,counts;
 return jsonb_build_object('total',total,'rows',rows,'counts',counts,'limit',lim,'offset',off);
end; $$;
revoke all on function public.admin_orders(jsonb) from public,anon,authenticated;
grant execute on function public.admin_orders(jsonb) to service_role;

create or replace function public.admin_order(target uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare o public.orders; r jsonb;
begin
 select * into o from public.orders where id=target;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 r:=public.admin_order_row(o);
 return r||jsonb_build_object(
  'items',(select coalesce(jsonb_agg(jsonb_build_object('design',oi.design_id,'addon',oi.addon_code,'unit_price_minor',oi.unit_price_minor) order by oi.addon_code nulls first),'[]'::jsonb) from public.order_items oi where oi.order_id=o.id),
  'payment',(select jsonb_build_object('provider',p.provider,'id',p.provider_payment_id,'amount_minor',p.amount_minor,'currency',p.currency,'verified_at',p.verified_at) from public.payments p where p.order_id=o.id),
  'event_timezone',(select s.event_timezone from public.stripe_checkouts s where s.order_id=o.id),
  'access_expires_at',o.access_expires_at,
  'entitlement',(select jsonb_build_object('source',e.source,'expires_at',e.expires_at,'revoked_at',e.revoked_at) from public.invitation_entitlements e where e.invitation_id=o.invitation_id),
  'households',(select count(*) from public.households h where h.invitation_id=o.invitation_id),
  'guests',(select count(*) from public.guests g join public.households h on h.id=g.household_id where h.invitation_id=o.invitation_id),
  'attending',(select count(*) from public.guest_responses gr join public.guests g on g.id=gr.guest_id join public.households h on h.id=g.household_id where h.invitation_id=o.invitation_id and gr.attendance='attending'));
end; $$;
revoke all on function public.admin_order(uuid) from public,anon,authenticated;
grant execute on function public.admin_order(uuid) to service_role;

create or replace function public.admin_codes() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',dc.id,'code',dc.code,'kind',dc.kind,'percent_off',dc.percent_off,'amount_off_cop',dc.amount_off_cop,'amount_off_usd',dc.amount_off_usd,
  'tiers',dc.tiers,'max_uses',dc.max_uses,'once_per_customer',dc.once_per_customer,'starts_at',dc.starts_at,'ends_at',dc.ends_at,'active',dc.active,'note',dc.note,'created_at',dc.created_at,
  'uses',(select count(*) from public.orders o where o.discount_code_id=dc.id and o.status='paid'),
  'pending',(select count(*) from public.orders o where o.discount_code_id=dc.id and o.status='pending'),
  'discounted',(select coalesce(jsonb_object_agg(x.currency,x.total),'{}'::jsonb) from (select o.currency,sum(o.discount_minor) total from public.orders o where o.discount_code_id=dc.id and o.status='paid' group by o.currency) x))
  order by dc.active desc, dc.created_at desc),'[]'::jsonb) from public.discount_codes dc;
$$;
revoke all on function public.admin_codes() from public,anon,authenticated;
grant execute on function public.admin_codes() to service_role;

create or replace function public.admin_save_code(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare dc public.discount_codes;
begin
 insert into public.discount_codes(code,kind,percent_off,amount_off_cop,amount_off_usd,tiers,max_uses,once_per_customer,starts_at,ends_at,note)
 values(upper(btrim(payload->>'code')),payload->>'kind',(payload->>'percent_off')::integer,(payload->>'amount_off_cop')::bigint,(payload->>'amount_off_usd')::bigint,
  coalesce((select array_agg(t) from jsonb_array_elements_text(payload->'tiers') t),array['esencial','signature','luxury']::text[]),
  (payload->>'max_uses')::integer,coalesce((payload->>'once_per_customer')::boolean,false),(payload->>'starts_at')::timestamptz,(payload->>'ends_at')::timestamptz,coalesce(payload->>'note',''))
 returning * into dc;
 return to_jsonb(dc);
exception when unique_violation then raise exception 'CODE_EXISTS';
end; $$;
revoke all on function public.admin_save_code(jsonb) from public,anon,authenticated;
grant execute on function public.admin_save_code(jsonb) to service_role;

create or replace function public.admin_set_code_active(target uuid, enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.discount_codes set active=enabled where id=target;
 if not found then raise exception 'CODE_NOT_FOUND'; end if;
end; $$;
revoke all on function public.admin_set_code_active(uuid,boolean) from public,anon,authenticated;
grant execute on function public.admin_set_code_active(uuid,boolean) to service_role;

-- Resumen y analíticas desde `since`. Ingresos por moneda (nunca se suman pesos y dólares).
create or replace function public.admin_summary(since timestamptz) returns jsonb language sql stable security definer set search_path='' as $$
 with paid as (
  select o.*, p.verified_at, (select t.tier from public.invitations i join public.design_price_tiers t on t.design_id=i.design_id where i.id=o.invitation_id) tier,
   (select i.design_id from public.invitations i where i.id=o.invitation_id) design
  from public.orders o join public.payments p on p.order_id=o.id where o.status='paid' and p.verified_at>=since
 )
 select jsonb_build_object(
  'revenue',(select coalesce(jsonb_object_agg(x.currency,jsonb_build_object('total',x.total,'orders',x.n)),'{}'::jsonb) from (select currency,sum(total_minor) total,count(*) n from paid group by currency) x),
  'paid',(select count(*) from paid),
  'discounted',(select count(*) from paid where discount_minor>0),
  'by_tier',(select coalesce(jsonb_object_agg(x.tier,x.n),'{}'::jsonb) from (select coalesce(tier,'esencial') tier,count(*) n from paid group by 1) x),
  'by_design',(select coalesce(jsonb_agg(jsonb_build_object('design',x.design,'tier',x.tier,'paid',x.n) order by x.n desc),'[]'::jsonb) from (select design,tier,count(*) n from paid group by 1,2) x),
  'weekly',(select coalesce(jsonb_agg(jsonb_build_object('week',x.week,'currency',x.currency,'total',x.total) order by x.week),'[]'::jsonb) from (select date_trunc('week',verified_at) week,currency,sum(total_minor) total from paid group by 1,2) x),
  'pending',(select count(*) from public.orders where status='pending'),
  'pending_stale',(select count(*) from public.orders where status='pending' and created_at<now()-interval '1 hour'),
  'refunded',(select count(*) from public.orders where status='refunded' and created_at>=since),
  'published',(select count(*) from public.invitations where state='published'),
  'paid_unpublished',(select count(*) from public.invitations i where i.state<>'published' and public.invitation_is_enabled(i.id)),
  'drafts',(select count(*) from public.invitation_drafts where created_at>=since),
  'responses',(select count(*) from public.guest_responses),
  'attending',(select count(*) from public.guest_responses where attendance='attending'),
  'households',(select count(*) from public.households),
  'codes_ending',(select coalesce(jsonb_agg(jsonb_build_object('code',dc.code,'ends_at',dc.ends_at,'max_uses',dc.max_uses,'uses',(select count(*) from public.orders o where o.discount_code_id=dc.id and o.status='paid'))),'[]'::jsonb) from public.discount_codes dc where dc.active and dc.ends_at between now() and now()+interval '7 days'),
  'recent',(select coalesce(jsonb_agg(public.admin_order_row(o) order by o.created_at desc),'[]'::jsonb) from (select * from public.orders order by created_at desc limit 5) o)
 );
$$;
revoke all on function public.admin_summary(timestamptz) from public,anon,authenticated;
grant execute on function public.admin_summary(timestamptz) to service_role;

create or replace function public.admin_analytics(since timestamptz) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'funnel',jsonb_build_object(
   'started',(select count(*) from public.invitation_drafts where created_at>=since),
   'checkout',(select count(distinct invitation_id) from public.orders where created_at>=since),
   'paid',(select count(*) from public.orders o join public.payments p on p.order_id=o.id where o.status='paid' and p.verified_at>=since),
   'published',(select count(*) from public.invitations i where i.state='published' and exists(select 1 from public.orders o join public.payments p on p.order_id=o.id where o.invitation_id=i.id and p.verified_at>=since))),
  'designs',(select coalesce(jsonb_agg(x order by (x->>'paid')::int desc, x->>'design'),'[]'::jsonb) from (
    select jsonb_build_object('design',ds.id,'name',ds.name,'tier',(select t.tier from public.design_price_tiers t where t.design_id=ds.id),
     'started',(select count(*) from public.invitation_drafts d where d.design_id=ds.id and d.created_at>=since),
     'paid',(select count(*) from public.orders o join public.invitations i on i.id=o.invitation_id join public.payments p on p.order_id=o.id where i.design_id=ds.id and o.status='paid' and p.verified_at>=since)) x
    from public.designs ds) y),
  'currencies',(select coalesce(jsonb_object_agg(x.currency,x.n),'{}'::jsonb) from (select o.currency,count(*) n from public.orders o join public.payments p on p.order_id=o.id where o.status='paid' and p.verified_at>=since group by 1) x),
  'codes',(select coalesce(jsonb_agg(jsonb_build_object('code',x.code,'uses',x.n)),'[]'::jsonb) from (select dc.code,count(*) n from public.orders o join public.discount_codes dc on dc.id=o.discount_code_id where o.status='paid' and o.created_at>=since group by 1) x),
  'guests',jsonb_build_object('households',(select count(*) from public.households),'guests',(select count(*) from public.guests),
   'attending',(select count(*) from public.guest_responses where attendance='attending'),'declined',(select count(*) from public.guest_responses where attendance='declined'),
   'messages',(select count(*) from public.household_responses where length(btrim(message))>0))
 );
$$;
revoke all on function public.admin_analytics(timestamptz) from public,anon,authenticated;
grant execute on function public.admin_analytics(timestamptz) to service_role;

commit;
