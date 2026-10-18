-- Apply AFTER 202610180001_drafts.sql. Private operational data has no anonymous table access.
begin;
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
commit;
