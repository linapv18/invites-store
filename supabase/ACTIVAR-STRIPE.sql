-- Invitesse: activar Stripe y publicación. Ejecutar completo en SQL Editor del proyecto existente.
-- No borra cuentas ni borradores. Crea la plataforma si falta; instala precios y funciones nuevas.
-- Puede ejecutarse de nuevo; no crea permisos de compra falsos ni procesa cargos.
begin;
do $install$ begin
 if to_regclass('public.invitation_drafts') is null then execute $drafts$-- Run once in the Supabase SQL Editor. This creates private drafts, not published invitations.

create table public.invitation_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  design_id text not null check (design_id in ('clasico','moderno','rosa','jardin','costa','gala','aurelia','noir','lino','marfil','fiesta','celeste','cisne','tinta','glicina','estreno','nacar','arco','corazones','encaje','onix','senal')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 1048576),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, design_id)
);
alter table public.invitation_drafts enable row level security;
revoke all on public.invitation_drafts from anon, authenticated;
grant select on public.invitation_drafts to authenticated;
grant insert (owner_id, design_id, content) on public.invitation_drafts to authenticated;
create policy drafts_read_own on public.invitation_drafts for select to authenticated using ((select auth.uid()) = owner_id);
create policy drafts_create_own on public.invitation_drafts for insert to authenticated with check ((select auth.uid()) = owner_id);
-- No anonymous reads, no browser-controlled publication or purchase entitlements.
-- Updates go through one owner-checked function with revision conflict detection.
create function public.save_invitation_draft(draft_id uuid, draft_content jsonb, expected_revision integer)
returns public.invitation_drafts
language plpgsql security definer set search_path = ''
as $$
declare saved public.invitation_drafts;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  update public.invitation_drafts
     set content = draft_content, revision = revision + 1, updated_at = now()
   where id = draft_id and owner_id = auth.uid() and revision = expected_revision
   returning * into saved;
  if not found then raise exception 'DRAFT_CONFLICT_OR_NOT_FOUND' using errcode = 'P0001'; end if;
  return saved;
end;
$$;
revoke all on function public.save_invitation_draft(uuid,jsonb,integer) from public, anon;
grant execute on function public.save_invitation_draft(uuid,jsonb,integer) to authenticated;
$drafts$; end if;
 if to_regclass('public.invitations') is null then execute $platform$-- Apply AFTER 202610180001_drafts.sql. Private operational data has no anonymous table access.

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
$platform$; end if;
end; $install$;

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


-- 202610190002_publish_gifts.sql
-- Include optional gifts in public invitations; no changes to tables, RLS or permissions.

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


-- 202610190003_invitation_language.sql
-- Require one explicit invitation language in the public snapshot. No URL or cart can grant bilingual access.

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


-- 202610200001_stripe_checkout.sql

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


-- 202610200002_tier_prices.sql

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




-- 202610200003_admin_discounts.sql
-- Panel de administración y códigos de descuento.
-- Se puede ejecutar de nuevo sin efectos: crea lo que falta y reemplaza funciones.
-- Requiere 202610200002_tier_prices.sql. Los códigos son de Invitesse (no de Stripe): la orden se crea ya con el precio rebajado, Stripe cobra
-- exactamente ese total y apply_verified_payment acepta «precio de los productos − descuento validado».
-- Las funciones admin_* solo las puede llamar el servidor (service_role); api/admin.js verifica antes
-- que la sesión pertenezca a una cuenta autorizada (ADMIN_EMAILS).

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



-- 202610200004_full_discount.sql

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



-- 202610210001_design_changes.sql

-- Keep the purchase, original design, assets and expiry intact; only change the selected template.
alter table public.invitations add column if not exists selected_design_id text references public.designs(id);
create table if not exists public.invitation_design_changes (
 id uuid primary key default gen_random_uuid(),
 invitation_id uuid not null references public.invitations(id),
 order_id uuid not null references public.orders(id),
 from_design text not null references public.designs(id),
 to_design text not null references public.designs(id),
 ceiling_minor bigint not null,
 currency text not null,
 created_at timestamptz not null default now()
);
alter table public.invitation_design_changes enable row level security;
revoke all on public.invitation_design_changes from public,anon,authenticated;
grant all on public.invitation_design_changes to service_role;

create or replace function public.design_change_options(verified_owner uuid,purchase_design text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare d public.invitation_drafts;i public.invitations;paid record;locked boolean;
begin
 select * into d from public.invitation_drafts where owner_id=verified_owner and design_id=purchase_design;
 if not found then raise exception 'INVITATION_NOT_FOUND';end if;
 select * into i from public.invitations where id=d.id;
 if not public.invitation_is_enabled(d.id) then raise exception 'PUBLICATION_NOT_ENABLED';end if;
 select o.id,o.currency,oi.unit_price_minor*oi.quantity ceiling into paid
 from public.invitation_entitlements e join public.order_items oi on oi.id=e.order_item_id join public.orders o on o.id=oi.order_id
 where e.invitation_id=d.id and e.source='purchase' and e.revoked_at is null and o.status='paid' and o.owner_id=verified_owner and oi.design_id=d.design_id;
 if not found then raise exception 'PURCHASE_REQUIRED';end if;
 locked:=i.state<>'draft' or i.published_version_id is not null or exists(select 1 from public.invitation_versions where invitation_id=d.id);
 return jsonb_build_object('design',coalesce(i.selected_design_id,i.design_id),'revision',d.revision,'locked',locked,'currency',paid.currency,'ceiling_minor',paid.ceiling,
 'designs',(select coalesce(jsonb_agg(jsonb_build_object('id',p.design_id,'price_minor',p.price_minor,'allowed',not locked and p.price_minor<=paid.ceiling) order by p.design_id),'[]'::jsonb)
 from public.products p join public.designs t on t.id=p.design_id where t.available and p.active and p.currency=paid.currency and p.sku='invitation-'||p.design_id||'-'||lower(paid.currency)));
end;$$;
revoke all on function public.design_change_options(uuid,text) from public,anon,authenticated;
grant execute on function public.design_change_options(uuid,text) to service_role;

create or replace function public.switch_purchased_design(verified_owner uuid,purchase_design text,target_design text,expected_revision integer)
returns public.invitation_drafts language plpgsql security definer set search_path='' as $$
declare d public.invitation_drafts;i public.invitations;opts jsonb;paid_order uuid;
begin
 -- Same lock order as publication and draft saves: changing and publishing cannot race.
 select * into d from public.invitation_drafts where owner_id=verified_owner and design_id=purchase_design for update;
 if not found then raise exception 'INVITATION_NOT_FOUND';end if;
 select * into i from public.invitations where id=d.id for update;
 if expected_revision is null or d.revision<>expected_revision then raise exception 'DRAFT_CONFLICT';end if;
 opts:=public.design_change_options(verified_owner,purchase_design);
 if (opts->>'locked')::boolean then raise exception 'DESIGN_ALREADY_PUBLISHED';end if;
 if not exists(select 1 from jsonb_array_elements(opts->'designs') x where x->>'id'=target_design and (x->>'allowed')::boolean) then raise exception 'DESIGN_PRICE_TOO_HIGH';end if;
 if target_design=coalesce(i.selected_design_id,i.design_id) then return d;end if;
 select oi.order_id into paid_order from public.invitation_entitlements e join public.order_items oi on oi.id=e.order_item_id where e.invitation_id=d.id;
 insert into public.invitation_design_changes(invitation_id,order_id,from_design,to_design,ceiling_minor,currency)
 values(d.id,paid_order,coalesce(i.selected_design_id,i.design_id),target_design,(opts->>'ceiling_minor')::bigint,opts->>'currency');
 update public.invitations set selected_design_id=target_design where id=d.id;
 update public.invitation_drafts set content=content||jsonb_build_object('design',target_design),revision=revision+1,updated_at=now() where id=d.id returning * into d;
 return d;
end;$$;
revoke all on function public.switch_purchased_design(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.switch_purchased_design(uuid,text,text,integer) to service_role;

-- A normal browser save must not bypass the purchase-price or publication checks.
create or replace function public.guard_selected_template() returns trigger language plpgsql security definer set search_path='' as $$
declare selected text;
begin
 select coalesce(selected_design_id,design_id) into selected from public.invitations where id=new.id;
 if selected is null then selected:=new.design_id;end if;
 if new.content ? 'design' and new.content->>'design' is distinct from selected then raise exception 'DESIGN_CHANGE_REQUIRES_TRANSFER';end if;
 new.content:=new.content||jsonb_build_object('design',selected);
 return new;
end;$$;
drop trigger if exists draft_selected_template on public.invitation_drafts;
create trigger draft_selected_template before update of content on public.invitation_drafts for each row execute function public.guard_selected_template();
create or replace function public.publish_invitation(target uuid,expected_revision integer,requested_slug text,requested_access text default 'family') returns jsonb
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
 payload:=payload||jsonb_build_object('design',coalesce(i.selected_design_id,i.design_id));
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
create or replace function public.publication_payload(target uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',i.id,'slug',i.slug,'design',coalesce(v.content->>'design',i.design_id),'version',v.version,'content',v.content,'assets',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'kind',a.kind)) from public.publication_assets pa join public.invitation_assets a on a.id=pa.asset_id where pa.version_id=v.id),'[]'::jsonb))
 from public.invitations i join public.invitation_versions v on v.id=i.published_version_id where i.id=target and i.state='published' and public.invitation_is_enabled(i.id);
$$;


-- 202610210002_admin_order_management.sql

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


-- 202610210003_persistent_household_links.sql

-- Recoverable links are private capabilities: only the trusted API can read this table.
create table if not exists public.household_private_links (
 household_id uuid primary key references public.households(id) on delete cascade,
 token text not null check(token ~ '^[a-f0-9]{64}$')
);
alter table public.household_private_links enable row level security;
revoke all on public.household_private_links from public,anon,authenticated;
grant all on public.household_private_links to service_role;
alter table public.households add column if not exists sent_at timestamptz;
create or replace function public.rotate_guest_link(target_household uuid,valid_until timestamptz default null) returns text language plpgsql security definer set search_path='' as $$
declare raw_token text;
begin
 if not exists(select 1 from public.households h where h.id=target_household and public.owns_invitation(h.invitation_id)) then raise exception 'HOUSEHOLD_NOT_FOUND'; end if;
 if valid_until is not null and valid_until<=now() then raise exception 'INVALID_EXPIRY'; end if;
 -- Serializes concurrent rotations. Only the final issued link remains active.
 perform 1 from public.households where id=target_household for update;
 raw_token:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 update public.guest_access_links set revoked_at=now() where household_id=target_household and revoked_at is null;
 insert into public.guest_access_links(household_id,token_hash,expires_at) values(target_household,encode(sha256(convert_to(raw_token,'UTF8')),'hex'),valid_until);
 insert into public.household_private_links(household_id,token) values(target_household,raw_token) on conflict(household_id) do update set token=excluded.token;
 return raw_token;
end; $$;
revoke all on function public.rotate_guest_link(uuid,timestamptz) from public,anon;
grant execute on function public.rotate_guest_link(uuid,timestamptz) to authenticated;

create or replace function public.ensure_household_links(verified_owner uuid,target_invitation uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare h record; raw text; result jsonb:='{}'::jsonb;
begin
 if not exists(select 1 from public.invitations where id=target_invitation and owner_id=verified_owner) then raise exception 'INVITATION_NOT_FOUND';end if;
 for h in select id from public.households where invitation_id=target_invitation order by id for update loop
  select token into raw from public.household_private_links where household_id=h.id;
  if raw is null or not exists(select 1 from public.guest_access_links where household_id=h.id and token_hash=encode(sha256(convert_to(raw,'UTF8')),'hex') and revoked_at is null and (expires_at is null or expires_at>now())) then
   raw:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
   -- Preserve previously shared links when upgrading existing invitations.
   insert into public.guest_access_links(household_id,token_hash) values(h.id,encode(sha256(convert_to(raw,'UTF8')),'hex'));
   insert into public.household_private_links(household_id,token) values(h.id,raw) on conflict(household_id) do update set token=excluded.token;
  end if;
  result:=result||jsonb_build_object(h.id::text,raw);
 end loop;
 return result;
end;$$;
revoke all on function public.ensure_household_links(uuid,uuid) from public,anon,authenticated;
grant execute on function public.ensure_household_links(uuid,uuid) to service_role;

create or replace function public.manage_panel_household(purchase_design text,operation text,target_household uuid,payload jsonb,expected_draft_revision integer,expected_household_revision integer default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.invitation_drafts;h public.households;made jsonb;hid uuid;eid text;entry jsonb;names text[];person jsonb;guest uuid;position integer:=0;
begin
 if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'AUTH_REQUIRED';end if;
 if operation is null or operation not in ('create','edit','delete','sent') then raise exception 'INVALID_REQUEST';end if;
 select * into d from public.invitation_drafts where owner_id=auth.uid() and design_id=purchase_design for update;
 if not found then raise exception 'INVITATION_NOT_FOUND';end if;
 if not public.invitation_is_enabled(d.id) then raise exception 'PUBLICATION_NOT_ENABLED';end if;
 if expected_draft_revision is null or d.revision<>expected_draft_revision then raise exception 'DRAFT_CONFLICT';end if;
 if operation='create' then
  if jsonb_typeof(payload->'people') is distinct from 'array' or jsonb_array_length(payload->'people') not between 1 and 50 then raise exception 'INVALID_GUEST_COUNT';end if;
  if jsonb_array_length(coalesce(d.content->'invitations','[]'))>=500 then raise exception 'INVALID_GUEST_COUNT';end if;
  select array_agg(value->>'name' order by ordinality) into names from jsonb_array_elements(payload->'people') with ordinality;
  made:=public.create_household(d.id,payload->>'name',names);hid:=(made->>'household_id')::uuid;eid:=gen_random_uuid()::text;
  insert into public.editor_households(invitation_id,editor_id,household_id) values(d.id,eid,hid);
 else
  select * into h from public.households where id=target_household and invitation_id=d.id for update;
  if not found then raise exception 'HOUSEHOLD_NOT_FOUND';end if;
  hid:=h.id;
  if expected_household_revision is null or not exists(select 1 from public.household_responses where household_id=hid and revision=expected_household_revision for update) then raise exception 'RESPONSE_CONFLICT';end if;
  select editor_id into eid from public.editor_households where invitation_id=d.id and household_id=hid;
  if operation='edit' then
   perform public.edit_household(hid,payload->>'name',payload->'people',expected_household_revision,h.email,h.phone);
   -- Owners can correct attendance in the same panel shown in the demo.
   for person in select value from jsonb_array_elements(payload->'people') loop
    select id into guest from public.guests where household_id=hid and sort_order=position;
    if person->'att' is null or person->'att'='null'::jsonb then delete from public.guest_responses where guest_id=guest;
    elsif person->'att' in ('true'::jsonb,'false'::jsonb) then
     insert into public.guest_responses(guest_id,attendance) values(guest,case when (person->>'att')::boolean then 'attending' else 'declined' end)
     on conflict(guest_id) do update set attendance=excluded.attendance,updated_at=now();
    else raise exception 'INVALID_REQUEST';end if;
    position:=position+1;
   end loop;
  elsif operation='delete' then perform public.delete_household(hid,expected_household_revision);
  elsif operation='sent' then
   if jsonb_typeof(payload->'sent') is distinct from 'boolean' then raise exception 'INVALID_REQUEST';end if;
   update public.households set sent_at=case when (payload->>'sent')::boolean then coalesce(sent_at,now()) else null end where id=hid;
   update public.household_responses set revision=revision+1,updated_at=now() where household_id=hid;
   return jsonb_build_object('household_id',hid,'revision',d.revision);
  end if;
 end if;
 -- Keep the editor's source list in sync so future publishing cannot undo panel edits.
 if operation='delete' then
  select coalesce(jsonb_agg(value order by ordinality),'[]') into entry from jsonb_array_elements(coalesce(d.content->'invitations','[]')) with ordinality where value->>'id' is distinct from eid;
 else
  if eid is null then eid:=gen_random_uuid()::text;insert into public.editor_households values(d.id,eid,hid);end if;
  select jsonb_build_object('id',eid,'name',label,'people',(select jsonb_agg(display_name order by sort_order) from public.guests where household_id=hid)) into entry from public.households where id=hid;
  select coalesce(jsonb_agg(case when value->>'id'=eid then entry else value end order by ordinality),'[]') into made from jsonb_array_elements(coalesce(d.content->'invitations','[]')) with ordinality;
  if not exists(select 1 from jsonb_array_elements(coalesce(d.content->'invitations','[]')) where value->>'id'=eid) then made:=made||jsonb_build_array(entry);end if;
  entry:=made;
 end if;
 update public.invitation_drafts set content=jsonb_set(content,'{invitations}',entry),revision=revision+1,updated_at=now() where id=d.id;
 return jsonb_build_object('household_id',hid,'revision',d.revision+1);
end;$$;
revoke all on function public.manage_panel_household(text,text,uuid,jsonb,integer,integer) from public,anon;
grant execute on function public.manage_panel_household(text,text,uuid,jsonb,integer,integer) to authenticated;
-- Existing invitations get a persistent link without revoking their previously shared links.
do $$ declare i record;begin for i in select distinct v.id,v.owner_id from public.invitations v join public.households h on h.invitation_id=v.id loop perform public.ensure_household_links(i.owner_id,i.id);end loop;end;$$;

commit;
