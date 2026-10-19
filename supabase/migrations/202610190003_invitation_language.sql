-- Require one explicit invitation language in the public snapshot. No URL or cart can grant bilingual access.
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
