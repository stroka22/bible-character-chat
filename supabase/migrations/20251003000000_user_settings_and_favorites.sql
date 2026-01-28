-- User settings table for per-user preferences
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  featured_character_id uuid references public.characters(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

-- RLS
alter table public.user_settings enable row level security;

drop policy if exists user_settings_select_self on public.user_settings;
create policy user_settings_select_self on public.user_settings
  for select using ( auth.uid() = user_id );

drop policy if exists user_settings_upsert_self on public.user_settings;
create policy user_settings_upsert_self on public.user_settings
  for insert with check ( auth.uid() = user_id );

drop policy if exists user_settings_update_self on public.user_settings;
create policy user_settings_update_self on public.user_settings
  for update using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

-- User favorites table
create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, character_id)
);

alter table public.user_favorites enable row level security;

drop policy if exists user_favorites_select_self on public.user_favorites;
create policy user_favorites_select_self on public.user_favorites
  for select using ( auth.uid() = user_id );

drop policy if exists user_favorites_insert_self on public.user_favorites;
create policy user_favorites_insert_self on public.user_favorites
  for insert with check ( auth.uid() = user_id );

drop policy if exists user_favorites_delete_self on public.user_favorites;
create policy user_favorites_delete_self on public.user_favorites
  for delete using ( auth.uid() = user_id );

-- Optional: allow updates (not used, but harmless)
drop policy if exists user_favorites_update_self on public.user_favorites;
create policy user_favorites_update_self on public.user_favorites
  for update using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );
