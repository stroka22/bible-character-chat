-- bible-character-chat/scripts/characters_policies_admin_superadmin.sql
-- Idempotent script to configure RLS policies for the characters table
-- Allows admin/superadmin roles to insert/update/delete characters

begin;

-- Enable row level security on characters table
alter table public.characters enable row level security;

-- Update policy
drop policy if exists "characters_update_admin_superadmin" on public.characters;
create policy "characters_update_admin_superadmin"
  on public.characters
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

-- Insert policy
drop policy if exists "characters_insert_admin_superadmin" on public.characters;
create policy "characters_insert_admin_superadmin"
  on public.characters
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

-- Delete policy
drop policy if exists "characters_delete_admin_superadmin" on public.characters;
create policy "characters_delete_admin_superadmin"
  on public.characters
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

commit;
