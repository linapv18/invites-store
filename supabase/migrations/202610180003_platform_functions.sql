begin;
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
commit;
