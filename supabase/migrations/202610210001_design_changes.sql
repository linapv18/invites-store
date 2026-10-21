begin;
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
commit;
