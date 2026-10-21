begin;
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
