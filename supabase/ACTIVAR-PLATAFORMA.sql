-- Invitesse: execute once in Supabase SQL Editor, AFTER migration 001.
-- This transaction creates the remaining platform tables/functions/private bucket.
-- Do not run both this file and individual migrations 002/003/004.
begin;

-- 202610180002_platform_tables.sql
-- Apply AFTER 202610180001_drafts.sql. Private operational data has no anonymous table access.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name)<=160),
  locale text not null default 'es' check (locale in ('es','en')),
  created_at timestamptz not null default now()
);
create table public.designs (
  id text primary key,
  name text not null,
  available boolean not null default true
);
insert into public.designs(id,name) values
 ('clasico','Clásico'),('moderno','Moderno'),('rosa','Romántico'),('jardin','Jardín'),('costa','Costa'),('gala','Gala'),('aurelia','Aurelia'),('noir','Noir'),('lino','Lino'),('marfil','Marfil'),('fiesta','Fiesta'),('celeste','Celeste'),('cisne','Cisne'),('tinta','Tinta'),('glicina','Glicina'),('estreno','Estreno'),('nacar','Nácar'),('arco','Arco'),('corazones','Corazones'),('encaje','Encaje'),('onix','Ónix'),('senal','Señal');
alter table public.invitation_drafts add constraint drafts_identity unique(id,owner_id,design_id);
create table public.invitations (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  design_id text not null references public.designs(id),
  slug text unique check(slug is null or (length(slug) between 3 and 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')),
  state text not null default 'draft' check(state in ('draft','published','paused')),
  access_mode text not null default 'family' check(access_mode in ('family','public')),
  published_version_id uuid,
  created_at timestamptz not null default now(),
  unique(id,owner_id),
  foreign key(id,owner_id,design_id) references public.invitation_drafts(id,owner_id,design_id) on delete cascade,
  check(state<>'published' or (slug is not null and published_version_id is not null))
);
create table public.invitation_versions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  version integer not null check(version>0),
  draft_revision integer not null check(draft_revision>=0),
  content jsonb not null check(jsonb_typeof(content)='object' and octet_length(content::text)<=1048576),
  created_at timestamptz not null default now(),
  unique(invitation_id,version), unique(invitation_id,id)
);
alter table public.invitations add constraint invitation_version_belongs_here foreign key(id,published_version_id) references public.invitation_versions(invitation_id,id) deferrable initially deferred;

create table public.invitation_assets (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  object_path text not null unique,
  kind text not null check(kind in ('image','audio')),
  mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp','image/avif','audio/mpeg')),
  size_bytes bigint not null check(size_bytes>0 and size_bytes<=15728640),
  created_at timestamptz not null default now(),
  check((kind='image' and mime_type like 'image/%') or (kind='audio' and mime_type='audio/mpeg'))
);
create table public.publication_assets (
  version_id uuid not null references public.invitation_versions(id) on delete cascade,
  asset_id uuid not null references public.invitation_assets(id) on delete restrict,
  primary key(version_id,asset_id)
);
create table public.households (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  label text not null check(length(trim(label)) between 1 and 160),
  email text not null default '' check(length(email)<=254),
  phone text not null default '' check(length(phone)<=40),
  created_at timestamptz not null default now()
);
create index households_invitation on public.households(invitation_id);
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  display_name text not null check(length(trim(display_name)) between 1 and 160),
  sort_order integer not null default 0 check(sort_order>=0),
  created_at timestamptz not null default now()
);
create index guests_household on public.guests(household_id);
create table public.guest_access_links (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index guest_links_household on public.guest_access_links(household_id);
create table public.household_responses (
  household_id uuid primary key references public.households(id) on delete cascade,
  revision integer not null default 0 check(revision>=0),
  message text not null default '' check(length(message)<=2000),
  last_request_id uuid,
  updated_at timestamptz not null default now()
);
create table public.guest_responses (
  guest_id uuid primary key references public.guests(id) on delete cascade,
  attendance text not null check(attendance in ('attending','declined')),
  dietary_notes text not null default '' check(length(dietary_notes)<=1000),
  updated_at timestamptz not null default now()
);

-- Prices deliberately absent until configured by the business. No fake active products.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  design_id text references public.designs(id),
  addon_code text check(addon_code in ('playlist','libro','capsula','encuestas','galeria','bilingue','dominio')),
  price_minor bigint check(price_minor>=0),
  currency text check(currency ~ '^[A-Z]{3}$'),
  active boolean not null default false,
  check((design_id is null) <> (addon_code is null)),
  check(not active or (price_minor is not null and currency is not null))
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  invitation_id uuid not null references public.invitations(id) on delete restrict,
  checkout_request_id uuid not null unique default gen_random_uuid(),
  status text not null default 'pending' check(status in ('pending','paid','cancelled','refunded')),
  total_minor bigint not null check(total_minor>=0),
  access_expires_at timestamptz,
  currency text not null check(currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  foreign key(invitation_id,owner_id) references public.invitations(id,owner_id)
);
create index orders_owner on public.orders(owner_id);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  design_id text references public.designs(id),
  addon_code text check(addon_code in ('playlist','libro','capsula','encuestas','galeria','bilingue','dominio')),
  unit_price_minor bigint not null check(unit_price_minor>=0),
  quantity integer not null default 1 check(quantity=1),
  unique(order_id,product_id),
  check((design_id is null) <> (addon_code is null))
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  provider text not null check(length(provider) between 1 and 64),
  provider_payment_id text not null check(length(provider_payment_id) between 1 and 255),
  amount_minor bigint not null check(amount_minor>=0),
  currency text not null check(currency ~ '^[A-Z]{3}$'),
  verified_at timestamptz not null default now(),
  unique(provider,provider_payment_id)
);
create table public.payment_events (
  provider text not null,
  event_id text not null check(length(event_id) between 1 and 255),
  order_id uuid not null references public.orders(id),
  processed_at timestamptz not null default now(),
  primary key(provider,event_id)
);
create table public.invitation_entitlements (
  invitation_id uuid primary key references public.invitations(id) on delete cascade,
  source text not null check(source in ('purchase','manual')),
  order_item_id uuid unique references public.order_items(id),
  reason text not null default '',
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  check((source='purchase' and order_item_id is not null) or (source='manual' and order_item_id is null and length(trim(reason))>0))
);
create table public.addon_entitlements (
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  addon_code text not null check(addon_code in ('playlist','libro','capsula','encuestas','galeria','bilingue','dominio')),
  order_item_id uuid not null references public.order_items(id),
  revoked_at timestamptz,
  granted_at timestamptz not null default now(),
  primary key(invitation_id,addon_code)
);
create table public.addon_settings (
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  addon_code text not null,
  settings jsonb not null default '{}'::jsonb check(jsonb_typeof(settings)='object' and octet_length(settings::text)<=65536),
  primary key(invitation_id,addon_code),
  foreign key(invitation_id,addon_code) references public.addon_entitlements(invitation_id,addon_code)
);

create function public.initialize_invitation()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.invitations(id,owner_id,design_id) values(new.id,new.owner_id,new.design_id);
 return new;
end; $$;
revoke all on function public.initialize_invitation() from public,anon,authenticated;
create trigger draft_has_invitation after insert on public.invitation_drafts for each row execute function public.initialize_invitation();


-- Read ownership helpers have fixed search paths and never accept an owner from the browser.
create function public.owns_invitation(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.invitations i where i.id=target and i.owner_id=auth.uid());
$$;
revoke all on function public.owns_invitation(uuid) from public,anon;
grant execute on function public.owns_invitation(uuid) to authenticated;

-- Every operational table is protected, including tables exclusively used by the server.
do $$ declare t text; begin
 foreach t in array array['profiles','designs','invitations','invitation_versions','invitation_assets','publication_assets','households','guests','guest_access_links','household_responses','guest_responses','products','orders','order_items','payments','payment_events','invitation_entitlements','addon_entitlements','addon_settings'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant select,insert on public.profiles to authenticated;
grant update(display_name,locale) on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profile_create on public.profiles for insert to authenticated with check(id=(select auth.uid()));
create policy profile_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
grant select on public.designs to anon,authenticated;
create policy visible_designs on public.designs for select to anon,authenticated using(available);
grant select on public.invitations,public.invitation_versions,public.invitation_assets,public.publication_assets,public.households,public.guests,public.guest_access_links,public.household_responses,public.guest_responses,public.invitation_entitlements,public.addon_entitlements,public.addon_settings,public.orders,public.order_items,public.payments to authenticated;
create policy invitation_read on public.invitations for select to authenticated using(owner_id=(select auth.uid()));
create policy version_read on public.invitation_versions for select to authenticated using(public.owns_invitation(invitation_id));
create policy asset_read on public.invitation_assets for select to authenticated using(public.owns_invitation(invitation_id));
create policy published_assets_read on public.publication_assets for select to authenticated using(exists(select 1 from public.invitation_versions v where v.id=version_id and public.owns_invitation(v.invitation_id)));
create policy household_read on public.households for select to authenticated using(public.owns_invitation(invitation_id));
create policy guest_read on public.guests for select to authenticated using(exists(select 1 from public.households h where h.id=household_id and public.owns_invitation(h.invitation_id)));
create policy link_read on public.guest_access_links for select to authenticated using(exists(select 1 from public.households h where h.id=household_id and public.owns_invitation(h.invitation_id)));
create policy household_response_read on public.household_responses for select to authenticated using(exists(select 1 from public.households h where h.id=household_id and public.owns_invitation(h.invitation_id)));
create policy guest_response_read on public.guest_responses for select to authenticated using(exists(select 1 from public.guests g join public.households h on h.id=g.household_id where g.id=guest_id and public.owns_invitation(h.invitation_id)));
create policy entitlement_read on public.invitation_entitlements for select to authenticated using(public.owns_invitation(invitation_id));
create policy addon_read on public.addon_entitlements for select to authenticated using(public.owns_invitation(invitation_id));
create policy settings_read on public.addon_settings for select to authenticated using(public.owns_invitation(invitation_id));
create policy order_read on public.orders for select to authenticated using(owner_id=(select auth.uid()));
create policy order_item_read on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.owner_id=(select auth.uid())));
create policy payment_read on public.payments for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.owner_id=(select auth.uid())));
-- No client write grants on published versions, orders, payments or entitlements.
-- Backfill after ALTER TABLE/RLS setup, so deferred FK checks do not block DDL.
insert into public.invitations(id,owner_id,design_id) select id,owner_id,design_id from public.invitation_drafts;


-- 202610180003_platform_functions.sql

create function public.invitation_is_enabled(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.invitation_entitlements e where e.invitation_id=target and e.revoked_at is null and (e.expires_at is null or e.expires_at>now()));
$$;
revoke all on function public.invitation_is_enabled(uuid) from public,anon,authenticated;

-- Construct a publication, never copy the entire private editor document.
create function public.public_invitation_content(source jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; field text; permitted text[];
begin
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into result from jsonb_each(source)
 where key=any(array['v','design','n1','n2','date','city','cover','msg','pal','palCustom','sealMode','sealText','mono','monoImg','storyTitle','story','gallery','musicOn','musicSource','musicTrack','musicTrackSrc','timeZone','courtPair','photoBW','photosOn','envIntro','envClosing','countdownId','countdownNote','quote','quoteAuthor','dressCode','dressNotes','dressColors','viajeOn','travelIntro','hotel','hotelAddress','hotelCode','hotelLink','hotelNotes','airport','transport','guideFood','guideCulture','guidePlans','rsvpDeadline','rsvpMsg','rsvpDiet','rsvpNote','shareMode','sharePhoto']);
 foreach field in array array['events','faqs','polls'] loop
  permitted:=case field when 'events' then array['id','name','time','place','address','mapUrl'] when 'faqs' then array['id','q','a'] else array['id','q','opts'] end;
  if jsonb_typeof(source->field)='array' then
   result:=result||jsonb_build_object(field,(select coalesce(jsonb_agg(clean order by position),'[]'::jsonb) from (
    select a.ordinality as position,(select coalesce(jsonb_object_agg(e.key,e.value),'{}'::jsonb) from jsonb_each(case when jsonb_typeof(a.value)='object' then a.value else '{}'::jsonb end) e where e.key=any(permitted)) clean from jsonb_array_elements(source->field) with ordinality a
   ) rows));
  end if;
 end loop;
 return result;
end; $$;
revoke all on function public.public_invitation_content(jsonb) from public,anon,authenticated;

create function public.publish_invitation(target uuid,expected_revision integer,requested_slug text,requested_access text default 'family') returns jsonb
language plpgsql security definer set search_path='' as $$
declare d public.invitation_drafts; i public.invitations; version_id uuid; sequence integer; payload jsonb; asset_ref text; asset_uuid uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 select * into d from public.invitation_drafts where id=target and owner_id=auth.uid() for update;
 if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'EMAIL_NOT_CONFIRMED'; end if;
 if expected_revision is null or d.revision<>expected_revision then raise exception 'DRAFT_CONFLICT'; end if;
 if not public.invitation_is_enabled(target) then raise exception 'PUBLICATION_NOT_ENABLED'; end if;
 if requested_access not in ('family','public') or requested_access is null then raise exception 'INVALID_ACCESS_MODE'; end if;
 if requested_slug is null or length(requested_slug) not between 3 and 80 or requested_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'INVALID_SLUG'; end if;
 select * into i from public.invitations where id=target for update;
 if i.slug is not null and i.slug<>requested_slug then raise exception 'SLUG_ALREADY_SET'; end if;
 if jsonb_typeof(d.content->'n1') is distinct from 'string' or jsonb_typeof(d.content->'n2') is distinct from 'string' or jsonb_typeof(d.content->'date') is distinct from 'string' then raise exception 'PUBLICATION_INCOMPLETE'; end if;
 if length(trim(coalesce(d.content->>'n1','')))=0 or length(trim(coalesce(d.content->>'n2','')))=0 or coalesce(d.content->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'PUBLICATION_INCOMPLETE'; end if;
 perform (d.content->>'date')::date;
 if coalesce(d.content->>'timeZone','')<>'' and not exists(select 1 from pg_catalog.pg_timezone_names where name=d.content->>'timeZone') then raise exception 'INVALID_TIME_ZONE'; end if;
 -- Uploaded local-only audio must not appear as if it were available to guests.
 if d.content->>'musicSource'='upload' and coalesce(d.content->>'musicTrackSrc','') not like 'asset:%' then raise exception 'AUDIO_NOT_UPLOADED'; end if;
 payload:=public.public_invitation_content(d.content);
 payload:=payload||jsonb_build_object('design',i.design_id);
 if not exists(select 1 from public.addon_entitlements e where e.invitation_id=target and e.addon_code='encuestas' and e.revoked_at is null) then payload:=payload-'polls'; end if;
 select coalesce(max(version),0)+1 into sequence from public.invitation_versions where invitation_id=target;
 insert into public.invitation_versions(invitation_id,version,draft_revision,content) values(target,sequence,d.revision,payload) returning id into version_id;
 -- Only assets actually referenced by this snapshot are readable by guests.
 for asset_ref in select value from (
  select payload->>'cover' value union select payload->>'monoImg' union select payload->>'musicTrackSrc'
  union select jsonb_array_elements_text(case when jsonb_typeof(payload->'gallery')='array' then payload->'gallery' else '[]'::jsonb end)
 ) refs where value like 'asset:%' loop
  asset_uuid:=substring(asset_ref from 7)::uuid;
  if not exists(select 1 from public.invitation_assets a where a.id=asset_uuid and a.invitation_id=target) then raise exception 'ASSET_NOT_OWNED'; end if;
  insert into public.publication_assets(version_id,asset_id) values(version_id,asset_uuid) on conflict do nothing;
 end loop;
 update public.invitations set slug=requested_slug,state='published',access_mode=requested_access,published_version_id=version_id where id=target;
 return jsonb_build_object('id',target,'slug',requested_slug,'version',sequence,'access_mode',requested_access);
end; $$;
revoke all on function public.publish_invitation(uuid,integer,text,text) from public,anon;
grant execute on function public.publish_invitation(uuid,integer,text,text) to authenticated;

create function public.pause_invitation(target uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.invitations set state='paused' where id=target and owner_id=auth.uid();
 if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
end; $$;
revoke all on function public.pause_invitation(uuid) from public,anon;
grant execute on function public.pause_invitation(uuid) to authenticated;

create function public.publication_payload(target uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',i.id,'slug',i.slug,'design',i.design_id,'version',v.version,'content',v.content,'assets',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'kind',a.kind)) from public.publication_assets pa join public.invitation_assets a on a.id=pa.asset_id where pa.version_id=v.id),'[]'::jsonb))
 from public.invitations i join public.invitation_versions v on v.id=i.published_version_id where i.id=target and i.state='published' and public.invitation_is_enabled(i.id);
$$;
revoke all on function public.publication_payload(uuid) from public,anon,authenticated;
create function public.get_published_invitation(requested_slug text) returns jsonb language sql stable security definer set search_path='' as $$
 select public.publication_payload(i.id) from public.invitations i where i.slug=requested_slug and i.access_mode='public';
$$;
revoke all on function public.get_published_invitation(text) from public;
grant execute on function public.get_published_invitation(text) to anon,authenticated;

create function public.rotate_guest_link(target_household uuid,valid_until timestamptz default null) returns text language plpgsql security definer set search_path='' as $$
declare raw_token text;
begin
 if not exists(select 1 from public.households h where h.id=target_household and public.owns_invitation(h.invitation_id)) then raise exception 'HOUSEHOLD_NOT_FOUND'; end if;
 if valid_until is not null and valid_until<=now() then raise exception 'INVALID_EXPIRY'; end if;
 -- Serializes concurrent rotations. Only the final issued link remains active.
 perform 1 from public.households where id=target_household for update;
 raw_token:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 update public.guest_access_links set revoked_at=now() where household_id=target_household and revoked_at is null;
 insert into public.guest_access_links(household_id,token_hash,expires_at) values(target_household,encode(sha256(convert_to(raw_token,'UTF8')),'hex'),valid_until);
 return raw_token;
end; $$;
revoke all on function public.rotate_guest_link(uuid,timestamptz) from public,anon;
grant execute on function public.rotate_guest_link(uuid,timestamptz) to authenticated;

create function public.create_household(target uuid,family_name text,guest_names text[],contact_email text default '',contact_phone text default '') returns jsonb language plpgsql security definer set search_path='' as $$
declare household uuid; token text; idx integer;
begin
 if not public.owns_invitation(target) then raise exception 'INVITATION_NOT_FOUND'; end if;
 if coalesce(cardinality(guest_names),0) not between 1 and 50 then raise exception 'INVALID_GUEST_COUNT'; end if;
 if exists(select 1 from unnest(guest_names) n where n is null or length(trim(n)) not between 1 and 160) then raise exception 'INVALID_GUEST_NAME'; end if;
 insert into public.households(invitation_id,label,email,phone) values(target,family_name,contact_email,contact_phone) returning id into household;
 for idx in 1..cardinality(guest_names) loop insert into public.guests(household_id,display_name,sort_order) values(household,trim(guest_names[idx]),idx-1); end loop;
 insert into public.household_responses(household_id) values(household);
 token:=public.rotate_guest_link(household);
 return jsonb_build_object('household_id',household,'token',token);
end; $$;
revoke all on function public.create_household(uuid,text,text[],text,text) from public,anon;
grant execute on function public.create_household(uuid,text,text[],text,text) to authenticated;

create function public.resolve_guest_token(raw_token text) returns uuid language sql stable security definer set search_path='' as $$
 select h.id from public.guest_access_links l join public.households h on h.id=l.household_id join public.invitations i on i.id=h.invitation_id
 where length(raw_token)=64 and raw_token ~ '^[a-f0-9]{64}$' and l.token_hash=encode(sha256(convert_to(raw_token,'UTF8')),'hex')
 and l.revoked_at is null and (l.expires_at is null or l.expires_at>now()) and i.state='published' and public.invitation_is_enabled(i.id);
$$;
revoke all on function public.resolve_guest_token(text) from public,anon,authenticated;
create function public.get_guest_invitation(raw_token text) returns jsonb language sql stable security definer set search_path='' as $$
 select public.publication_payload(h.invitation_id)||jsonb_build_object('household',jsonb_build_object('id',h.id,'name',h.label),'response',jsonb_build_object('revision',r.revision,'message',r.message),'guests',coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'name',g.display_name,'attendance',gr.attendance,'dietary_notes',gr.dietary_notes) order by g.sort_order) from public.guests g left join public.guest_responses gr on gr.guest_id=g.id where g.household_id=h.id),'[]'::jsonb))
 from public.households h join public.household_responses r on r.household_id=h.id where h.id=public.resolve_guest_token(raw_token);
$$;
revoke all on function public.get_guest_invitation(text) from public;
grant execute on function public.get_guest_invitation(text) to anon,authenticated;

create function public.submit_guest_response(raw_token text,answers jsonb,response_message text,expected_revision integer,request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare household uuid; current_response public.household_responses; person jsonb; count_guests integer;
begin
 household:=public.resolve_guest_token(raw_token);
 if household is null then raise exception 'INVITATION_UNAVAILABLE'; end if;
 select * into current_response from public.household_responses where household_id=household for update;
 if not found then raise exception 'INVITATION_UNAVAILABLE'; end if;
 if request_id is null then raise exception 'REQUEST_ID_REQUIRED'; end if;
 if current_response.last_request_id=request_id then return jsonb_build_object('revision',current_response.revision); end if;
 if expected_revision is null or current_response.revision<>expected_revision then raise exception 'RESPONSE_CONFLICT'; end if;
 if jsonb_typeof(answers) is distinct from 'array' or coalesce(length(response_message),0)>2000 then raise exception 'INVALID_RESPONSE'; end if;
 select count(*) into count_guests from public.guests where household_id=household;
 if jsonb_array_length(answers)<>count_guests or (select count(distinct a->>'id') from jsonb_array_elements(answers) a)<>count_guests then raise exception 'INVALID_RESPONSE'; end if;
 for person in select value from jsonb_array_elements(answers) loop
  if coalesce(person->>'attendance','') not in ('attending','declined') or length(coalesce(person->>'dietary_notes',''))>1000 then raise exception 'INVALID_RESPONSE'; end if;
  if not exists(select 1 from public.guests g where g.id=(person->>'id')::uuid and g.household_id=household) then raise exception 'INVALID_RESPONSE'; end if;
 end loop;
 for person in select value from jsonb_array_elements(answers) loop
  insert into public.guest_responses(guest_id,attendance,dietary_notes) values((person->>'id')::uuid,person->>'attendance',coalesce(person->>'dietary_notes',''))
  on conflict(guest_id) do update set attendance=excluded.attendance,dietary_notes=excluded.dietary_notes,updated_at=now();
 end loop;
 update public.household_responses set revision=revision+1,message=coalesce(response_message,''),last_request_id=request_id,updated_at=now() where household_id=household returning * into current_response;
 return jsonb_build_object('revision',current_response.revision);
end; $$;
revoke all on function public.submit_guest_response(text,jsonb,text,integer,uuid) from public;
grant execute on function public.submit_guest_response(text,jsonb,text,integer,uuid) to anon,authenticated;

-- Owner edits preserve stable guest IDs and reject stale edits after an RSVP.
create function public.edit_household(target_household uuid,family_name text,people jsonb,expected_revision integer,contact_email text default '',contact_phone text default '') returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.household_responses; person jsonb; kept uuid[]:='{}'; guest_id uuid; position integer:=0;
begin
 if not exists(select 1 from public.households h where h.id=target_household and public.owns_invitation(h.invitation_id)) then raise exception 'HOUSEHOLD_NOT_FOUND'; end if;
 perform 1 from public.households where id=target_household for update;
 select * into r from public.household_responses where household_id=target_household for update;
 if expected_revision is null or r.revision<>expected_revision then raise exception 'RESPONSE_CONFLICT'; end if;
 if jsonb_typeof(people) is distinct from 'array' then raise exception 'INVALID_GUESTS'; end if;
 if jsonb_array_length(people) not between 1 and 50 then raise exception 'INVALID_GUEST_COUNT'; end if;
 if (select count(p->>'id') from jsonb_array_elements(people) p)<>(select count(distinct p->>'id') from jsonb_array_elements(people) p) then raise exception 'DUPLICATE_GUEST'; end if;
 for person in select value from jsonb_array_elements(people) loop
  if length(trim(coalesce(person->>'name',''))) not between 1 and 160 then raise exception 'INVALID_GUEST_NAME'; end if;
  if person->>'id' is not null and not exists(select 1 from public.guests g where g.id=(person->>'id')::uuid and g.household_id=target_household) then raise exception 'INVALID_GUEST'; end if;
 end loop;
 update public.households set label=family_name,email=contact_email,phone=contact_phone where id=target_household;
 for person in select value from jsonb_array_elements(people) loop
  guest_id:=(person->>'id')::uuid;
  if guest_id is null then
   insert into public.guests(household_id,display_name,sort_order) values(target_household,trim(person->>'name'),position) returning id into guest_id;
  else
   update public.guests set display_name=trim(person->>'name'),sort_order=position where id=guest_id;
  end if;
  kept:=array_append(kept,guest_id); position:=position+1;
 end loop;
 delete from public.guests where household_id=target_household and not(id=any(kept));
 update public.household_responses set revision=revision+1,last_request_id=null,updated_at=now() where household_id=target_household returning * into r;
 return jsonb_build_object('revision',r.revision);
end; $$;
revoke all on function public.edit_household(uuid,text,jsonb,integer,text,text) from public,anon;
grant execute on function public.edit_household(uuid,text,jsonb,integer,text,text) to authenticated;
create function public.delete_household(target_household uuid,expected_revision integer) returns void language plpgsql security definer set search_path='' as $$
declare r public.household_responses;
begin
 if not exists(select 1 from public.households h where h.id=target_household and public.owns_invitation(h.invitation_id)) then raise exception 'HOUSEHOLD_NOT_FOUND'; end if;
 perform 1 from public.households where id=target_household for update;
 select * into r from public.household_responses where household_id=target_household for update;
 if expected_revision is null or r.revision<>expected_revision then raise exception 'RESPONSE_CONFLICT'; end if;
 delete from public.households where id=target_household;
end; $$;
revoke all on function public.delete_household(uuid,integer) from public,anon;
grant execute on function public.delete_household(uuid,integer) to authenticated;

create function public.save_addon_settings(target uuid,addon text,payload jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.owns_invitation(target) or not exists(select 1 from public.addon_entitlements e where e.invitation_id=target and e.addon_code=addon and e.revoked_at is null) then raise exception 'ADDON_NOT_ENABLED'; end if;
 insert into public.addon_settings(invitation_id,addon_code,settings) values(target,addon,payload) on conflict(invitation_id,addon_code) do update set settings=excluded.settings;
end; $$;
revoke all on function public.save_addon_settings(uuid,text,jsonb) from public,anon;
grant execute on function public.save_addon_settings(uuid,text,jsonb) to authenticated;


-- 202610180004_storage_payments.sql

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


-- 202610190001_publish_dress_timeline.sql
-- Publica también los colores del código de vestimenta (dressSuggest, dressAvoid) y la historia como línea de tiempo
-- (storyMode, timeline con id/when/title/text). Sustituye la función de 202610180003 sin tocar nada más.

-- Construct a publication, never copy the entire private editor document.
create or replace function public.public_invitation_content(source jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; field text; permitted text[];
begin
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into result from jsonb_each(source)
 where key=any(array['v','design','n1','n2','date','city','cover','msg','pal','palCustom','sealMode','sealText','mono','monoImg','storyTitle','story','gallery','musicOn','musicSource','musicTrack','musicTrackSrc','timeZone','courtPair','photoBW','photosOn','envIntro','envClosing','countdownId','countdownNote','quote','quoteAuthor','dressCode','dressNotes','dressColors','dressSuggest','dressAvoid','storyMode','viajeOn','travelIntro','hotel','hotelAddress','hotelCode','hotelLink','hotelNotes','airport','transport','guideFood','guideCulture','guidePlans','rsvpDeadline','rsvpMsg','rsvpDiet','rsvpNote','shareMode','sharePhoto']);
 foreach field in array array['events','faqs','polls','timeline'] loop
  permitted:=case field when 'events' then array['id','name','time','place','address','mapUrl'] when 'faqs' then array['id','q','a'] when 'timeline' then array['id','when','title','text'] else array['id','q','opts'] end;
  if jsonb_typeof(source->field)='array' then
   result:=result||jsonb_build_object(field,(select coalesce(jsonb_agg(clean order by position),'[]'::jsonb) from (
    select a.ordinality as position,(select coalesce(jsonb_object_agg(e.key,e.value),'{}'::jsonb) from jsonb_each(case when jsonb_typeof(a.value)='object' then a.value else '{}'::jsonb end) e where e.key=any(permitted)) clean from jsonb_array_elements(source->field) with ordinality a
   ) rows));
  end if;
 end loop;
 return result;
end; $$;
revoke all on function public.public_invitation_content(jsonb) from public,anon,authenticated;


commit;

-- 202610190002_publish_gifts.sql
begin;
-- Construct a publication, never copy the entire private editor document.
create or replace function public.public_invitation_content(source jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; field text; permitted text[];
begin
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into result from jsonb_each(source)
 where key=any(array['v','design','n1','n2','date','city','cover','msg','pal','palCustom','sealMode','sealText','mono','monoImg','storyTitle','story','gallery','musicOn','musicSource','musicTrack','musicTrackSrc','timeZone','courtPair','photoBW','photosOn','envIntro','envClosing','countdownId','countdownNote','quote','quoteAuthor','dressCode','dressNotes','dressColors','dressSuggest','dressAvoid','storyMode','giftsOn','giftsMessage','giftsEnvelopes','giftsRegistryUrl','viajeOn','travelIntro','hotel','hotelAddress','hotelCode','hotelLink','hotelNotes','airport','transport','guideFood','guideCulture','guidePlans','rsvpDeadline','rsvpMsg','rsvpDiet','rsvpNote','shareMode','sharePhoto']);
 foreach field in array array['events','faqs','polls','timeline'] loop
  permitted:=case field when 'events' then array['id','name','time','place','address','mapUrl'] when 'faqs' then array['id','q','a'] when 'timeline' then array['id','when','title','text'] else array['id','q','opts'] end;
  if jsonb_typeof(source->field)='array' then
   result:=result||jsonb_build_object(field,(select coalesce(jsonb_agg(clean order by position),'[]'::jsonb) from (
    select a.ordinality as position,(select coalesce(jsonb_object_agg(e.key,e.value),'{}'::jsonb) from jsonb_each(case when jsonb_typeof(a.value)='object' then a.value else '{}'::jsonb end) e where e.key=any(permitted)) clean from jsonb_array_elements(source->field) with ordinality a
   ) rows));
  end if;
 end loop;
 return result;
end; $$;
revoke all on function public.public_invitation_content(jsonb) from public,anon,authenticated;
commit;

-- 202610190003_invitation_language.sql
begin;
-- Construct a publication, never copy the entire private editor document.
create or replace function public.public_invitation_content(source jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; field text; permitted text[];
begin
 if coalesce(source->>'invitationLanguage','') not in ('es','en') then raise exception 'INVITATION_LANGUAGE_REQUIRED'; end if;
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into result from jsonb_each(source)
 where key=any(array['invitationLanguage','v','design','n1','n2','date','city','cover','msg','pal','palCustom','sealMode','sealText','mono','monoImg','storyTitle','story','gallery','musicOn','musicSource','musicTrack','musicTrackSrc','timeZone','courtPair','photoBW','photosOn','envIntro','envClosing','countdownId','countdownNote','quote','quoteAuthor','dressCode','dressNotes','dressColors','dressSuggest','dressAvoid','storyMode','giftsOn','giftsMessage','giftsEnvelopes','giftsRegistryUrl','viajeOn','travelIntro','hotel','hotelAddress','hotelCode','hotelLink','hotelNotes','airport','transport','guideFood','guideCulture','guidePlans','rsvpDeadline','rsvpMsg','rsvpDiet','rsvpNote','shareMode','sharePhoto']);
 foreach field in array array['events','faqs','polls','timeline'] loop
  permitted:=case field when 'events' then array['id','name','time','place','address','mapUrl'] when 'faqs' then array['id','q','a'] when 'timeline' then array['id','when','title','text'] else array['id','q','opts'] end;
  if jsonb_typeof(source->field)='array' then
   result:=result||jsonb_build_object(field,(select coalesce(jsonb_agg(clean order by position),'[]'::jsonb) from (
    select a.ordinality as position,(select coalesce(jsonb_object_agg(e.key,e.value),'{}'::jsonb) from jsonb_each(case when jsonb_typeof(a.value)='object' then a.value else '{}'::jsonb end) e where e.key=any(permitted)) clean from jsonb_array_elements(source->field) with ordinality a
   ) rows));
  end if;
 end loop;
 return result;
end; $$;
revoke all on function public.public_invitation_content(jsonb) from public,anon,authenticated;
commit;
