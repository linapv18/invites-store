begin;
create table if not exists public.marketing_settings(admin_id uuid primary key references auth.users(id),data jsonb not null,updated_at timestamptz not null default now());
create table if not exists public.marketing_posts(id uuid primary key default gen_random_uuid(),data jsonb not null,status text not null check(status in ('idea','preparing','ready','scheduled','published','skipped')),scheduled_at timestamptz,revision integer not null default 1,schedule_version integer not null default 1,seed_key text unique,deleted_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists marketing_post_due on public.marketing_posts(scheduled_at) where deleted_at is null;
create table if not exists public.marketing_expenses(id uuid primary key default gen_random_uuid(),data jsonb not null,revision integer not null default 1,deleted_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.marketing_contacts(id uuid primary key default gen_random_uuid(),data jsonb not null,revision integer not null default 1,deleted_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.marketing_attributions(order_id uuid primary key references public.orders(id),channel text not null,campaign text not null default '',source text not null default 'manual' check(source='manual'),updated_at timestamptz not null default now());
create table if not exists public.marketing_exclusions(order_id uuid primary key references public.orders(id),reason text not null,updated_at timestamptz not null default now());
create table if not exists public.marketing_changes(id bigint generated always as identity primary key,actor uuid references auth.users(id),entity text not null,target uuid,action text not null,created_at timestamptz not null default now());
create table if not exists public.marketing_jobs(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.marketing_posts(id),admin_id uuid not null references auth.users(id),schedule_version integer not null,kind text not null check(kind in ('lead','day_before','overdue')),due_at timestamptz not null,status text not null default 'pending' check(status in ('pending','processing','sent','failed','cancelled')),attempts integer not null default 0,lease_token uuid,lease_until timestamptz,next_attempt_at timestamptz,payload jsonb,first_attempt_at timestamptz,sent_at timestamptz,last_error text,unique(post_id,admin_id,schedule_version,kind));
create index if not exists marketing_jobs_due on public.marketing_jobs(due_at,status);
create table if not exists public.marketing_notifications(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.marketing_posts(id),admin_id uuid not null references auth.users(id),schedule_version integer not null,kind text not null,title text not null,read_at timestamptz,cancelled boolean not null default false,created_at timestamptz not null default now(),unique(post_id,admin_id,schedule_version,kind));
do $$declare t text;begin foreach t in array array['marketing_settings','marketing_posts','marketing_expenses','marketing_contacts','marketing_attributions','marketing_exclusions','marketing_changes','marketing_jobs','marketing_notifications'] loop execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from public,anon,authenticated',t);execute format('grant all on public.%I to service_role',t);end loop;end;$$;

create or replace function public.marketing_tick(at_time timestamptz default now()) returns integer language plpgsql security definer set search_path='' as $$
declare settings_row record;post_row record;lead_time timestamptz;n integer;
begin
 update public.marketing_jobs j set status='cancelled',lease_token=null,lease_until=null where status in ('pending','processing') and (not exists(select 1 from public.marketing_posts p where p.id=j.post_id and p.deleted_at is null and p.status in ('preparing','ready','scheduled') and p.schedule_version=j.schedule_version) or (j.kind='day_before' and not exists(select 1 from public.marketing_settings s where s.admin_id=j.admin_id and (s.data->>'day_before')::boolean)));
 update public.marketing_notifications n set cancelled=true where not exists(select 1 from public.marketing_posts p where p.id=n.post_id and p.deleted_at is null and p.status in ('preparing','ready','scheduled') and p.schedule_version=n.schedule_version);
 for settings_row in select * from public.marketing_settings loop
  for post_row in select * from public.marketing_posts where deleted_at is null and status in ('preparing','ready','scheduled') and scheduled_at is not null loop
   lead_time:=post_row.scheduled_at-make_interval(mins=>(settings_row.data->>'lead_minutes')::integer);
   insert into public.marketing_jobs(post_id,admin_id,schedule_version,kind,due_at) values(post_row.id,settings_row.admin_id,post_row.schedule_version,'lead',greatest(lead_time,post_row.created_at))
   on conflict(post_id,admin_id,schedule_version,kind) do update set due_at=excluded.due_at where public.marketing_jobs.status='pending' and public.marketing_jobs.payload is null;
   if (settings_row.data->>'day_before')::boolean and post_row.scheduled_at-interval '1 day'>=post_row.created_at then
    insert into public.marketing_jobs(post_id,admin_id,schedule_version,kind,due_at) values(post_row.id,settings_row.admin_id,post_row.schedule_version,'day_before',post_row.scheduled_at-interval '1 day') on conflict(post_id,admin_id,schedule_version,kind) do update set status='pending' where public.marketing_jobs.status='cancelled' and public.marketing_jobs.attempts=0;
   end if;
   insert into public.marketing_jobs(post_id,admin_id,schedule_version,kind,due_at) values(post_row.id,settings_row.admin_id,post_row.schedule_version,'overdue',post_row.scheduled_at) on conflict do nothing;
  end loop;
 end loop;
 insert into public.marketing_notifications(post_id,admin_id,schedule_version,kind,title)
 select j.post_id,j.admin_id,j.schedule_version,j.kind,p.data->>'title' from public.marketing_jobs j join public.marketing_posts p on p.id=j.post_id where j.status<>'cancelled' and j.due_at<=at_time and p.deleted_at is null and p.status in ('preparing','ready','scheduled') and j.schedule_version=p.schedule_version on conflict do nothing;
 get diagnostics n=row_count;return n;
end;$$;
revoke all on function public.marketing_tick(timestamptz) from public,anon,authenticated;grant execute on function public.marketing_tick(timestamptz) to service_role;

create or replace function public.marketing_mutate(actor uuid,entity text,operation text,target uuid,payload jsonb,expected_revision integer default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.marketing_posts;item jsonb;row_json jsonb;table_name text;changed integer;new_id uuid;
begin
 if not exists(select 1 from auth.users where id=actor and email_confirmed_at is not null) then raise exception 'AUTH_REQUIRED';end if;
 if entity='settings' then
  insert into public.marketing_settings(admin_id,data) values(actor,payload) on conflict(admin_id) do update set data=excluded.data,updated_at=now();row_json:=payload;
 elsif entity='notification' then
  update public.marketing_notifications set read_at=case when (payload->>'read')::boolean then now() else null end where id=target and admin_id=actor;row_json:='{}';
 elsif entity='attribution' then
  if not exists(select 1 from public.orders where id=target) then raise exception 'ORDER_NOT_FOUND';end if;
  if operation='delete' then delete from public.marketing_attributions where order_id=target;else insert into public.marketing_attributions(order_id,channel,campaign) values(target,payload->>'channel',coalesce(payload->>'campaign','')) on conflict(order_id) do update set channel=excluded.channel,campaign=excluded.campaign,updated_at=now();end if;row_json:='{}';
 elsif entity='exclusion' then
  if operation='delete' then delete from public.marketing_exclusions where order_id=target;
  else insert into public.marketing_exclusions(order_id,reason) values(target,payload->>'reason') on conflict(order_id) do update set reason=excluded.reason;end if;row_json:='{}';
 elsif entity='plan' then
  for item in select value from jsonb_array_elements(payload) loop
   insert into public.marketing_posts(data,status,scheduled_at,seed_key) values(item-'seed_key',item->>'status',(item->>'scheduled_at')::timestamptz,item->>'seed_key') on conflict(seed_key) do nothing;
  end loop;row_json:='{}';
 elsif entity='post' then
  if operation='create' then
   insert into public.marketing_posts(data,status,scheduled_at) values(payload,payload->>'status',(payload->>'scheduled_at')::timestamptz) returning to_jsonb(marketing_posts.*) into row_json;new_id:=(row_json->>'id')::uuid;
  else
   select * into p from public.marketing_posts where id=target and deleted_at is null for update;
   if not found then raise exception 'MARKETING_NOT_FOUND';end if;
   if p.revision is distinct from expected_revision then raise exception 'MARKETING_CONFLICT';end if;
   if operation='delete' then update public.marketing_posts set deleted_at=now(),revision=revision+1,updated_at=now() where id=target returning to_jsonb(marketing_posts.*) into row_json;
   elsif operation='update' then
    update public.marketing_posts set data=payload,status=payload->>'status',scheduled_at=(payload->>'scheduled_at')::timestamptz,revision=revision+1,schedule_version=schedule_version+case when scheduled_at is distinct from (payload->>'scheduled_at')::timestamptz or (status in ('preparing','ready','scheduled')) is distinct from ((payload->>'status') in ('preparing','ready','scheduled')) then 1 else 0 end,updated_at=now() where id=target returning to_jsonb(marketing_posts.*) into row_json;
   else raise exception 'INVALID_REQUEST';end if;
  end if;
 elsif entity in ('expense','contact') then
  table_name:=case when entity='expense' then 'marketing_expenses' else 'marketing_contacts' end;
  if operation='create' then execute format('insert into public.%I(data) values($1) returning to_jsonb(%I.*)',table_name,table_name) into row_json using payload;
  elsif operation in ('update','delete') then
   execute format('update public.%I set data=case when $5 then data else $1 end,deleted_at=case when $5 then now() else null end,revision=revision+1,updated_at=now() where id=$2 and revision=$3 and deleted_at is null returning to_jsonb(%I.*)',table_name,table_name) into row_json using payload,target,expected_revision,actor,operation='delete';
   if row_json is null then raise exception 'MARKETING_CONFLICT';end if;
  else raise exception 'INVALID_REQUEST';end if;
 else raise exception 'INVALID_REQUEST';end if;
 insert into public.marketing_changes(actor,entity,target,action) values(actor,entity,coalesce(target,new_id),operation);
 perform public.marketing_tick();return coalesce(row_json,'{}');
end;$$;
revoke all on function public.marketing_mutate(uuid,text,text,uuid,jsonb,integer) from public,anon,authenticated;grant execute on function public.marketing_mutate(uuid,text,text,uuid,jsonb,integer) to service_role;

create or replace function public.marketing_data(actor uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
 'exclusions',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from public.marketing_exclusions x),
 'settings',(select data from public.marketing_settings where admin_id=actor),
 'posts',(select coalesce(jsonb_agg(to_jsonb(p) order by created_at desc),'[]') from (select * from public.marketing_posts order by created_at desc limit 2000) p),
 'expenses',(select coalesce(jsonb_agg(to_jsonb(e) order by created_at desc),'[]') from (select * from public.marketing_expenses where deleted_at is null order by created_at desc limit 2000) e),
 'contacts',(select coalesce(jsonb_agg(to_jsonb(c) order by updated_at desc),'[]') from (select * from public.marketing_contacts where deleted_at is null order by updated_at desc limit 2000) c),
 'notifications',(select coalesce(jsonb_agg(to_jsonb(n) order by created_at desc),'[]') from (select * from public.marketing_notifications where admin_id=actor and not cancelled order by created_at desc limit 100) n),
 'jobs',(select coalesce(jsonb_agg(to_jsonb(j)-'payload'-'lease_token' order by due_at desc),'[]') from (select * from public.marketing_jobs where admin_id=actor order by due_at desc limit 100) j),
 'changes',(select coalesce(jsonb_agg(to_jsonb(c)-'actor'-'target' order by created_at desc),'[]') from (select * from public.marketing_changes order by created_at desc limit 1000) c),
 'truncated',(select count(*)>2000 from public.marketing_posts),
 'sales',(select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'paid_at',p.verified_at,'amount_minor',p.amount_minor,'currency',p.currency,'owner_id',o.owner_id,'published',i.published_version_id is not null,'channel',a.channel,'campaign',a.campaign,'attribution_source',a.source,'first_purchase',not exists(select 1 from public.orders older join public.payments op on op.order_id=older.id where older.owner_id=o.owner_id and older.status='paid' and op.provider='stripe' and op.amount_minor>0 and op.verified_at<p.verified_at))),'[]')
 from public.orders o join public.payments p on p.order_id=o.id join public.invitations i on i.id=o.invitation_id left join public.marketing_attributions a on a.order_id=o.id
 where o.status='paid' and p.provider='stripe' and p.provider_payment_id like 'pi\_%' escape '\' and o.total_minor>0 and p.amount_minor>0 and not exists(select 1 from public.marketing_exclusions x where x.order_id=o.id) and not exists(select 1 from public.marketing_contacts c where c.deleted_at is null and c.data->>'owner_id'=o.owner_id::text and c.data->>'role' in ('tester','collaborator'))),
 'checkouts',(select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'at',o.created_at,'channel',a.channel)),'[]') from public.orders o join public.stripe_checkouts s on s.order_id=o.id left join public.marketing_attributions a on a.order_id=o.id where o.total_minor>0 and not exists(select 1 from public.marketing_exclusions x where x.order_id=o.id) and not exists(select 1 from public.marketing_contacts c where c.deleted_at is null and c.data->>'owner_id'=o.owner_id::text and c.data->>'role' in ('tester','collaborator')))

 );
$$;
revoke all on function public.marketing_data(uuid) from public,anon,authenticated;grant execute on function public.marketing_data(uuid) to service_role;

create or replace function public.marketing_claim_jobs(sender text,at_time timestamptz default now()) returns jsonb language plpgsql security definer set search_path='' as $$
declare j record;result jsonb:='[]';frozen jsonb;lease uuid;
begin
 perform public.marketing_tick(at_time);
 update public.marketing_jobs set status='failed',last_error='DELIVERY_UNCERTAIN_REVIEW' where status in ('pending','processing') and first_attempt_at<at_time-interval '23 hours' and sent_at is null;
 for j in select q.*,s.data settings,p.data post,p.scheduled_at,u.email verified_email from public.marketing_jobs q join public.marketing_settings s on s.admin_id=q.admin_id join public.marketing_posts p on p.id=q.post_id join auth.users u on u.id=q.admin_id
 where q.kind<>'overdue' and q.due_at<=at_time and q.attempts<5 and (q.status='pending' and (q.next_attempt_at is null or q.next_attempt_at<=at_time) or q.status='processing' and q.lease_until<at_time) and (s.data->>'email_enabled')::boolean and p.deleted_at is null and p.status in ('preparing','ready','scheduled') and p.schedule_version=q.schedule_version and u.email_confirmed_at is not null
 order by q.due_at limit 20 for update of q skip locked loop
  frozen:=coalesce(j.payload,jsonb_build_object('from',sender,'to',jsonb_build_array(j.settings->>'destination'),'subject','Invitesse · '||(j.post->>'title'),'text',(j.post->>'title')||E'\n'||(j.post->>'platform')||E'\nHorario Colombia: '||to_char(j.scheduled_at at time zone 'America/Bogota','YYYY-MM-DD HH24:MI')||E' (America/Bogota)\nhttps://www.invitesse.com/admin/#marketing?post='||j.post_id::text));lease:=gen_random_uuid();
  update public.marketing_jobs set status='processing',attempts=attempts+1,lease_token=lease,lease_until=at_time+interval '5 minutes',first_attempt_at=coalesce(first_attempt_at,at_time),payload=frozen where id=j.id;
  result:=result||jsonb_build_array(jsonb_build_object('id',j.id,'lease',lease,'payload',frozen,'verified_email',j.verified_email));
 end loop;return result;
end;$$;
revoke all on function public.marketing_claim_jobs(text,timestamptz) from public,anon,authenticated;grant execute on function public.marketing_claim_jobs(text,timestamptz) to service_role;
create or replace function public.marketing_job_valid(target uuid,lease uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.marketing_jobs j join public.marketing_posts p on p.id=j.post_id join public.marketing_settings s on s.admin_id=j.admin_id where j.id=target and j.lease_token=lease and j.status='processing' and p.deleted_at is null and p.status in ('preparing','ready','scheduled') and p.schedule_version=j.schedule_version and (s.data->>'email_enabled')::boolean);$$;
revoke all on function public.marketing_job_valid(uuid,uuid) from public,anon,authenticated;grant execute on function public.marketing_job_valid(uuid,uuid) to service_role;
create or replace function public.marketing_finish_job(target uuid,lease uuid,delivered boolean,error_code text default null,at_time timestamptz default now()) returns void language sql security definer set search_path='' as $$
 update public.marketing_jobs set status=case when delivered then 'sent' when attempts>=5 then 'failed' else 'pending' end,sent_at=case when delivered then at_time else null end,last_error=case when delivered then null else left(error_code,100) end,next_attempt_at=at_time+make_interval(mins=>power(2,attempts)::integer),lease_token=null,lease_until=null where id=target and lease_token=lease and status='processing';
$$;
revoke all on function public.marketing_finish_job(uuid,uuid,boolean,text,timestamptz) from public,anon,authenticated;grant execute on function public.marketing_finish_job(uuid,uuid,boolean,text,timestamptz) to service_role;
commit;
