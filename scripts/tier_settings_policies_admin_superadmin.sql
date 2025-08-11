-- scripts/tier_settings_policies_admin_superadmin.sql
-- Update RLS to allow both admin and superadmin to write to tier_settings
-- Idempotent: safe to run multiple times

alter table public.tier_settings enable row level security;

-- Drop old write policies
drop policy if exists tier_settings_insert_policy on public.tier_settings;
drop policy if exists tier_settings_update_policy on public.tier_settings;
drop policy if exists tier_settings_delete_policy on public.tier_settings;

-- Insert allowed for admin and superadmin
create policy tier_settings_insert_policy
  on public.tier_settings
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','superadmin')
    )
  );

-- Update allowed for admin and superadmin
create policy tier_settings_update_policy
  on public.tier_settings
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','superadmin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','superadmin')
    )
  );

-- Optional delete policy (keep disabled if not needed by UI)
create policy tier_settings_delete_policy
  on public.tier_settings
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','superadmin')
    )
  );

-- End of file
