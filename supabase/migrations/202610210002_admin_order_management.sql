begin;
-- Panel organization is separate from financial status. No payment or customer data is deleted.
alter table public.orders add column if not exists admin_archived_at timestamptz;
alter table public.orders add column if not exists admin_deleted_at timestamptz;
create table if not exists public.admin_order_events (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id),
 actor_id uuid not null references auth.users(id),
 action text not null check(action in ('archive','delete','restore')),
 created_at timestamptz not null default now()
);
alter table public.admin_order_events enable row level security;
revoke all on public.admin_order_events from public,anon,authenticated;
grant all on public.admin_order_events to service_role;
create index if not exists orders_admin_visibility on public.orders(admin_deleted_at,admin_archived_at,status,created_at desc);
create or replace function public.admin_order_row(o public.orders) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'archived_at',o.admin_archived_at,'deleted_at',o.admin_deleted_at,'checkout_session_id',(select sc.session_id from public.stripe_checkouts sc where sc.order_id=o.id),'selected_design',coalesce(i.selected_design_id,i.design_id),'id',o.id,'created_at',o.created_at,'status',o.status,'currency',o.currency,'total_minor',o.total_minor,'discount_minor',o.discount_minor,
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
declare st text:=nullif(filter->>'status',''); cur text:=nullif(filter->>'currency',''); ti text:=nullif(filter->>'tier',''); bucket text:=coalesce(filter->>'bucket','all'); visibility text:=coalesce(filter->>'visibility','active'); q text:=nullif(btrim(coalesce(filter->>'q','')),'');
 lim integer:=least(greatest(coalesce((filter->>'limit')::integer,25),1),100); off integer:=greatest(coalesce((filter->>'offset')::integer,0),0); rows jsonb; total integer; counts jsonb;
begin
 with base as (
  select o, public.admin_order_row(o) r from public.orders o
  where (cur is null or o.currency=cur)
   and (bucket='all' or (bucket='orders' and o.status in ('paid','refunded')) or (bucket='drafts' and o.status in ('pending','cancelled')))
   and ((visibility='active' and o.admin_deleted_at is null and o.admin_archived_at is null)
    or (visibility='archived' and o.admin_deleted_at is null and o.admin_archived_at is not null)
    or (visibility='trash' and o.admin_deleted_at is not null))
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
  'pending',(select count(*) from public.orders where admin_deleted_at is null and admin_archived_at is null and status='pending'),
  'pending_stale',(select count(*) from public.orders where admin_deleted_at is null and admin_archived_at is null and status='pending' and created_at<now()-interval '1 hour'),
  'refunded',(select count(*) from public.orders where status='refunded' and created_at>=since),
  'published',(select count(*) from public.invitations where state='published'),
  'paid_unpublished',(select count(*) from public.invitations i where i.state<>'published' and public.invitation_is_enabled(i.id)),
  'drafts',(select count(*) from public.invitation_drafts where created_at>=since),
  'responses',(select count(*) from public.guest_responses),
  'attending',(select count(*) from public.guest_responses where attendance='attending'),
  'households',(select count(*) from public.households),
  'codes_ending',(select coalesce(jsonb_agg(jsonb_build_object('code',dc.code,'ends_at',dc.ends_at,'max_uses',dc.max_uses,'uses',(select count(*) from public.orders o where o.discount_code_id=dc.id and o.status='paid'))),'[]'::jsonb) from public.discount_codes dc where dc.active and dc.ends_at between now() and now()+interval '7 days'),
  'recent',(select coalesce(jsonb_agg(public.admin_order_row(o) order by o.created_at desc),'[]'::jsonb) from (select * from public.orders where status in ('paid','refunded') and admin_deleted_at is null and admin_archived_at is null order by created_at desc limit 5) o)
 );
$$;
revoke all on function public.admin_summary(timestamptz) from public,anon,authenticated;
grant execute on function public.admin_summary(timestamptz) to service_role;

-- Stripe must be reconciled/expired by the API before deleting a pending checkout.
create or replace function public.admin_manage_order(target uuid,operation text,actor uuid,expected_status text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.orders;
begin
 if operation is null or operation not in ('archive','delete','restore') or actor is null then raise exception 'INVALID_REQUEST';end if;
 select * into o from public.orders where id=target for update;
 if not found then raise exception 'ORDER_NOT_FOUND';end if;
 if expected_status is not null and o.status<>expected_status then raise exception 'ORDER_STATE_CHANGED';end if;
 if operation='delete' and o.status='pending' then raise exception 'CHECKOUT_STILL_OPEN';end if;
 if operation='archive' and o.admin_deleted_at is not null then raise exception 'ORDER_IN_TRASH';end if;
 if operation='archive' then update public.orders set admin_archived_at=coalesce(admin_archived_at,now()) where id=target;
 elsif operation='delete' then update public.orders set admin_deleted_at=coalesce(admin_deleted_at,now()) where id=target;
 else update public.orders set admin_archived_at=null,admin_deleted_at=null where id=target;
 end if;
 insert into public.admin_order_events(order_id,actor_id,action) values(target,actor,operation);
 return public.admin_order(target);
end;$$;
revoke all on function public.admin_manage_order(uuid,text,uuid,text) from public,anon,authenticated;
grant execute on function public.admin_manage_order(uuid,text,uuid,text) to service_role;
commit;
