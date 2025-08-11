-- scripts/owners_policies_superadmin.sql
-- Sets up RLS policies for the owners table to restrict creation/modification to superadmins only
-- This script is idempotent and can be run multiple times safely

-- Create helper to read current user's role from profiles (security definer)
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Ensure RLS is on
alter table public.owners enable row level security;

-- Read policy (already present in min_owners.sql but safe to re-create)
drop policy if exists owners_select_policy on public.owners;
create policy owners_select_policy on public.owners
for select to authenticated using (true);

-- Superadmin-only insert/update
drop policy if exists owners_insert_superadmin on public.owners;
create policy owners_insert_superadmin on public.owners
for insert to authenticated
with check (public.current_user_role() = 'superadmin');

drop policy if exists owners_update_superadmin on public.owners;
create policy owners_update_superadmin on public.owners
for update to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');
