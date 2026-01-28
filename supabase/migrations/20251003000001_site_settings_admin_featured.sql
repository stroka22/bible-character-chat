-- Site/Org-level settings. We key by "owner_slug" so multi-tenant sites
-- (or branded deployments) can keep independent defaults.
create table if not exists public.site_settings (
  owner_slug text primary key,
  default_featured_character_id uuid references public.characters(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

-- Read for everyone (anon + authenticated)
drop policy if exists site_settings_select_all on public.site_settings;
create policy site_settings_select_all on public.site_settings
  for select
  using ( true );

-- Insert/update restricted to authenticated users with admin or superadmin role
drop policy if exists site_settings_insert_admin on public.site_settings;
create policy site_settings_insert_admin on public.site_settings
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin','superadmin')
    )
  );

drop policy if exists site_settings_update_admin on public.site_settings;
create policy site_settings_update_admin on public.site_settings
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin','superadmin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin','superadmin')
    )
  );
