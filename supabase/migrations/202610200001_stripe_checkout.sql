begin;
-- Stable business prices, in Stripe minor units. No browser-supplied totals.
insert into public.products(sku,design_id,price_minor,currency,active)
select 'invitation-'||d.id||'-'||lower(p.currency),d.id,p.amount,p.currency,true
from public.designs d cross join (values ('COP',20000000::bigint),('USD',7900::bigint)) p(currency,amount)
on conflict(sku) do update set price_minor=excluded.price_minor,currency=excluded.currency,active=true;

create table if not exists public.stripe_checkouts (
 order_id uuid primary key references public.orders(id),
 invitation_id uuid not null references public.invitations(id),
 event_date date not null,
 event_timezone text not null,
 session_id text unique,
 created_at timestamptz not null default now()
);
alter table public.stripe_checkouts add column if not exists parameters jsonb;
alter table public.stripe_checkouts enable row level security;
revoke all on public.stripe_checkouts from public,anon,authenticated;
grant all on public.stripe_checkouts to service_role;

create or replace function public.stripe_checkout_readiness() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('version',1,'prices',count(*)=44) from public.products where active and sku like 'invitation-%' and ((currency='COP' and price_minor=20000000) or (currency='USD' and price_minor=7900));
$$;
revoke all on function public.stripe_checkout_readiness() from public,anon,authenticated;
grant execute on function public.stripe_checkout_readiness() to service_role;

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
 if not found or (requested_currency='COP' and p.price_minor<>20000000) or (requested_currency='USD' and p.price_minor<>7900) then raise exception 'PRODUCT_UNAVAILABLE'; end if;
 result:=public.create_checkout_order(verified_owner,i.id,array[p.id],gen_random_uuid(),expiry);
 insert into public.stripe_checkouts(order_id,invitation_id,event_date,event_timezone) values((result->>'id')::uuid,i.id,day,zone);
 return jsonb_build_object('status','pending','order_id',result->>'id','amount',result->'amount_minor','currency',result->>'currency','event_date',day,'timezone',zone,'expires_at',expiry,'session_id',null,'invitation_id',i.id,'created_at',now());
end; $$;
revoke all on function public.prepare_stripe_checkout(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.prepare_stripe_checkout(uuid,text,text,integer) to service_role;

-- Once a Checkout exists, its event date is a purchase term. Other edits remain possible.
create or replace function public.guard_paid_event_date() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.stripe_checkouts c join public.orders o on o.id=c.order_id where c.invitation_id=new.id and o.status in ('pending','paid') and (coalesce(new.content->>'date','')<>c.event_date::text or coalesce(nullif(new.content->>'timeZone',''),'America/Bogota')<>c.event_timezone)) then raise exception 'PURCHASE_EVENT_DATE_LOCKED'; end if;
 return new;
end; $$;
revoke all on function public.guard_paid_event_date() from public,anon,authenticated;
drop trigger if exists stripe_event_date_locked on public.invitation_drafts;
create trigger stripe_event_date_locked before update of content on public.invitation_drafts for each row execute function public.guard_paid_event_date();

-- Status reconciliation uses server-verified Stripe state, never a browser claim.
create or replace function public.expire_stripe_order(target_order uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.orders set status='cancelled' where id=target_order and status='pending' and exists(select 1 from public.stripe_checkouts where order_id=target_order);
end; $$;
revoke all on function public.expire_stripe_order(uuid) from public,anon,authenticated;
grant execute on function public.expire_stripe_order(uuid) to service_role;
create or replace function public.quote_stripe_checkout(verified_owner uuid, requested_design text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.invitation_drafts; zone text; day date; expiry timestamptz; enabled boolean;
begin
 select * into d from public.invitation_drafts where owner_id=verified_owner and design_id=requested_design;
 if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
 if coalesce(d.content->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'EVENT_DETAILS_REQUIRED'; end if;
 day:=(d.content->>'date')::date; zone:=coalesce(nullif(d.content->>'timeZone',''),'America/Bogota');
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=zone) then raise exception 'INVALID_TIME_ZONE'; end if;
 expiry:=((day+interval '3 months'+interval '1 day')::timestamp at time zone zone);
 enabled:=public.invitation_is_enabled(d.id);
 if day<(now() at time zone zone)::date and not enabled then raise exception 'EVENT_DATE_IN_PAST'; end if;
 return jsonb_build_object('invitation_id',d.id,'design',d.design_id,'revision',d.revision,'event_date',day,'timezone',zone,'expires_at',expiry,'enabled',enabled,'slug',(select slug from public.invitations where id=d.id));
end; $$;
revoke all on function public.quote_stripe_checkout(uuid,text) from public,anon,authenticated;
grant execute on function public.quote_stripe_checkout(uuid,text) to service_role;
create or replace function public.configure_stripe_purchase(verified_owner uuid, requested_design text, event_day text, event_zone text)
returns void language plpgsql security definer set search_path='' as $$
declare d public.invitation_drafts; day date;
begin
 if not exists(select 1 from auth.users where id=verified_owner and email_confirmed_at is not null) then raise exception 'EMAIL_NOT_CONFIRMED'; end if;
 if not exists(select 1 from public.designs where id=requested_design and available) then raise exception 'PRODUCT_UNAVAILABLE'; end if;
 if event_day is null or event_day !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'EVENT_DETAILS_REQUIRED'; end if;
 if event_zone is null or not exists(select 1 from pg_catalog.pg_timezone_names where name=event_zone) then raise exception 'INVALID_TIME_ZONE'; end if;
 day:=event_day::date;
 if day<(now() at time zone event_zone)::date then raise exception 'EVENT_DATE_IN_PAST'; end if;
 insert into public.invitation_drafts(owner_id,design_id,content) values(verified_owner,requested_design,jsonb_build_object('v',1,'design',requested_design,'date',event_day,'timeZone',event_zone)) on conflict(owner_id,design_id) do nothing;
 select * into d from public.invitation_drafts where owner_id=verified_owner and design_id=requested_design for update;
 if d.content->>'date' is distinct from event_day or d.content->>'timeZone' is distinct from event_zone then
  update public.invitation_drafts set content=content||jsonb_build_object('date',event_day,'timeZone',event_zone),revision=revision+1,updated_at=now() where id=d.id;
 end if;
end; $$;
revoke all on function public.configure_stripe_purchase(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.configure_stripe_purchase(uuid,text,text,text) to service_role;

create table if not exists public.editor_households (
 invitation_id uuid not null references public.invitations(id) on delete cascade,
 editor_id text not null,
 household_id uuid not null unique references public.households(id) on delete cascade,
 primary key(invitation_id,editor_id)
);
alter table public.editor_households enable row level security;
revoke all on public.editor_households from public,anon,authenticated;
grant all on public.editor_households to service_role;

create or replace function public.publish_editor_invitation(target uuid, expected_revision integer, allow_public boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.invitation_drafts; i public.invitations; entry jsonb; names text[]; h uuid; made jsonb; people jsonb; rev integer; old record; result jsonb;
begin
 select * into d from public.invitation_drafts where id=target and owner_id=auth.uid() for update;
 if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
 if d.revision<>expected_revision then raise exception 'DRAFT_CONFLICT'; end if;
 if not public.invitation_is_enabled(target) then raise exception 'PUBLICATION_NOT_ENABLED'; end if;
 if jsonb_typeof(coalesce(d.content->'invitations','[]'))<>'array' or jsonb_array_length(coalesce(d.content->'invitations','[]'))>500 then raise exception 'INVALID_GUESTS'; end if;
 select * into i from public.invitations where id=target for update;
 -- An unguessable URL and noindex are still not access control. Family mode remains default.
 result:=public.publish_invitation(target,expected_revision,coalesce(i.slug,'boda-'||replace(target::text,'-','')),case when allow_public then 'public' else 'family' end);
 for entry in select value from jsonb_array_elements(coalesce(d.content->'invitations','[]')) loop
  if coalesce(entry->>'id','')='' or length(trim(coalesce(entry->>'name','')))=0 then raise exception 'INVALID_GUEST_NAME'; end if;
  select array_agg(trim(value)) into names from jsonb_array_elements_text(entry->'people');
  if coalesce(cardinality(names),0) not between 1 and 50 or exists(select 1 from unnest(names) n where length(n) not between 1 and 160) then raise exception 'INVALID_GUEST_COUNT'; end if;
  select household_id into h from public.editor_households where invitation_id=target and editor_id=entry->>'id';
  if h is null then
   made:=public.create_household(target,entry->>'name',names);
   insert into public.editor_households values(target,entry->>'id',(made->>'household_id')::uuid);
  else
   -- Match unchanged names to their stable guest IDs so replies survive republishing.
   with desired as (select value,ordinality,row_number() over(partition by value order by ordinality) occurrence from unnest(names) with ordinality n(value,ordinality)), existing as (select id,display_name,row_number() over(partition by display_name order by sort_order,id) occurrence from public.guests where household_id=h) select coalesce(jsonb_agg(jsonb_build_object('id',g.id,'name',n.value) order by n.ordinality),'[]') into people from desired n left join existing g on g.display_name=n.value and g.occurrence=n.occurrence;
   select revision into rev from public.household_responses where household_id=h;
   -- Avoid bumping revision on an unchanged guest list.
   if (select label from public.households where id=h) is distinct from entry->>'name' or (select array_agg(display_name order by sort_order) from public.guests where household_id=h) is distinct from names then
    perform public.edit_household(h,entry->>'name',people,rev);
   end if;
  end if;
 end loop;
 for old in select eh.household_id from public.editor_households eh where eh.invitation_id=target and not exists(select 1 from jsonb_array_elements(coalesce(d.content->'invitations','[]')) e where e->>'id'=eh.editor_id) loop
  select revision into rev from public.household_responses where household_id=old.household_id;
  perform public.delete_household(old.household_id,rev);
 end loop;
 return result;
end; $$;
revoke all on function public.publish_editor_invitation(uuid,integer,boolean) from public,anon;
grant execute on function public.publish_editor_invitation(uuid,integer,boolean) to authenticated;
create or replace function public.freeze_stripe_parameters(target_order uuid, payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 select parameters into result from public.stripe_checkouts where order_id=target_order for update;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 if result is null then
  update public.stripe_checkouts set parameters=payload where order_id=target_order;
  result:=payload;
 end if;
 return result;
end; $$;
revoke all on function public.freeze_stripe_parameters(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.freeze_stripe_parameters(uuid,jsonb) to service_role;
create or replace function public.revoke_stripe_order(target_order uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.orders o join public.stripe_checkouts c on c.order_id=o.id where o.id=target_order for update of o;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 update public.orders set status='refunded' where id=target_order;
 update public.invitation_entitlements set revoked_at=now() where order_item_id in(select id from public.order_items where order_id=target_order);
 update public.addon_entitlements set revoked_at=now() where order_item_id in(select id from public.order_items where order_id=target_order);
end; $$;
revoke all on function public.revoke_stripe_order(uuid) from public,anon,authenticated;
grant execute on function public.revoke_stripe_order(uuid) to service_role;
commit;
