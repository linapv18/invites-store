begin;
-- New purchases use the selected design's range. Existing order totals are immutable.
create table if not exists public.design_price_tiers (
 design_id text primary key references public.designs(id),
 tier text not null check(tier in ('esencial','signature','luxury'))
);
alter table public.design_price_tiers enable row level security;
revoke all on public.design_price_tiers from public,anon,authenticated;
grant all on public.design_price_tiers to service_role;
insert into public.design_price_tiers(design_id,tier) values
('jardin','signature'),
('costa','signature'),
('rosa','signature'),
('aurelia','signature'),
('gala','signature'),
('lino','esencial'),
('noir','esencial'),
('marfil','luxury'),
('celeste','signature'),
('fiesta','esencial'),
('cisne','luxury'),
('tinta','esencial'),
('glicina','luxury'),
('senal','signature'),
('onix','esencial'),
('encaje','luxury'),
('corazones','signature'),
('arco','signature'),
('nacar','signature'),
('estreno','esencial'),
('clasico','esencial'),
('moderno','esencial')
on conflict(design_id) do update set tier=excluded.tier;
create or replace function public.invitation_price_minor(design text,market text) returns bigint language sql stable security definer set search_path='' as $$
 select case tier when 'esencial' then case market when 'COP' then 12900000 when 'USD' then 4900 end when 'signature' then case market when 'COP' then 19900000 when 'USD' then 7900 end when 'luxury' then case market when 'COP' then 27900000 when 'USD' then 10900 end end from public.design_price_tiers where design_id=design;
$$;
revoke all on function public.invitation_price_minor(text,text) from public,anon,authenticated;
grant execute on function public.invitation_price_minor(text,text) to service_role;
insert into public.products(sku,design_id,price_minor,currency,active)
select 'invitation-'||d.design_id||'-'||lower(m.currency),d.design_id,public.invitation_price_minor(d.design_id,m.currency),m.currency,true
from public.design_price_tiers d cross join (values ('COP'),('USD')) m(currency)
on conflict(sku) do update set price_minor=excluded.price_minor,currency=excluded.currency,active=true;
create or replace function public.stripe_checkout_readiness() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('version',2,'prices',
 (select count(*)=22 from public.design_price_tiers) and
 (select count(*)=44 from public.products p join public.design_price_tiers t on t.design_id=p.design_id
 where p.active and p.sku='invitation-'||p.design_id||'-'||lower(p.currency) and p.price_minor=public.invitation_price_minor(p.design_id,p.currency)));
$$;
create or replace function public.prepare_stripe_checkout(verified_owner uuid, requested_design text, requested_currency text, expected_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.invitation_drafts; i public.invitations; o public.orders; c public.stripe_checkouts; p public.products; day date; zone text; expiry timestamptz; result jsonb;
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
  select * into c from public.stripe_checkouts where order_id=o.id;
  return jsonb_build_object('status','pending','order_id',o.id,'amount',o.total_minor,'currency',o.currency,'event_date',c.event_date,'timezone',c.event_timezone,'expires_at',o.access_expires_at,'session_id',c.session_id,'invitation_id',i.id,'created_at',o.created_at);
 end if;
 select * into p from public.products where sku='invitation-'||requested_design||'-'||lower(requested_currency) and active;
 if not found or p.price_minor is distinct from public.invitation_price_minor(requested_design,requested_currency) then raise exception 'PRODUCT_UNAVAILABLE'; end if;
 result:=public.create_checkout_order(verified_owner,i.id,array[p.id],gen_random_uuid(),expiry);
 insert into public.stripe_checkouts(order_id,invitation_id,event_date,event_timezone) values((result->>'id')::uuid,i.id,day,zone);
 return jsonb_build_object('status','pending','order_id',result->>'id','amount',result->'amount_minor','currency',result->>'currency','event_date',day,'timezone',zone,'expires_at',expiry,'session_id',null,'invitation_id',i.id,'created_at',now());
end; $$;
revoke all on function public.prepare_stripe_checkout(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.prepare_stripe_checkout(uuid,text,text,integer) to service_role;


commit;
