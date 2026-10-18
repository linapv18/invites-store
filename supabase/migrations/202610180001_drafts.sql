-- Run once in the Supabase SQL Editor. This creates private drafts, not published invitations.
begin;
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
commit;
