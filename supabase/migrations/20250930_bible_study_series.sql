-- Bible Study Series schema
-- Created: 2025-09-30

-- Enable extensions used for UUIDs and triggers if not present
create extension if not exists "uuid-ossp";

-- bible_study_series: container for ordered studies
create table if not exists public.bible_study_series (
  id uuid primary key default uuid_generate_v4(),
  owner_slug text not null,
  slug text not null,
  title text not null,
  description text,
  cover_image_url text,
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  show_in_nav boolean not null default false,
  is_premium boolean not null default false,
  auto_premium_if_any boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bible_study_series_owner_slug_slug_uniq unique (owner_slug, slug)
);

-- bible_study_series_items: ordered items within a series
create table if not exists public.bible_study_series_items (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid not null references public.bible_study_series(id) on delete cascade,
  study_id uuid not null references public.bible_studies(id) on delete restrict,
  order_index integer not null default 0,
  override_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bible_study_series_items_series_order_uniq unique (series_id, order_index),
  constraint bible_study_series_items_series_study_uniq unique (series_id, study_id)
);

-- user_series_progress: tracks a user's position within a series
create table if not exists public.user_series_progress (
  user_id uuid not null,
  series_id uuid not null references public.bible_study_series(id) on delete cascade,
  current_index integer not null default 0,
  completed_items jsonb not null default '[]'::jsonb,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, series_id)
);

-- Updated_at trigger (reuse common trigger if exists)
do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    perform set_updated_at('public.bible_study_series'::regclass);
    perform set_updated_at('public.bible_study_series_items'::regclass);
    perform set_updated_at('public.user_series_progress'::regclass);
  end if;
end $$;

-- RLS
alter table public.bible_study_series enable row level security;
alter table public.bible_study_series_items enable row level security;
alter table public.user_series_progress enable row level security;

-- NOTE: Initial permissive policies suitable for development. These can be
-- hardened later to enforce org/role-based access similar to profiles.

-- Series: allow read for all; writes for authenticated users (admins via app UI)
create policy bible_study_series_select_all on public.bible_study_series
  for select using (true);

create policy bible_study_series_write_authenticated on public.bible_study_series
  for all
  to authenticated
  using (true)
  with check (true);

-- Series items: readable by all; write by authenticated
create policy bible_study_series_items_select_all on public.bible_study_series_items
  for select using (true);

create policy bible_study_series_items_write_authenticated on public.bible_study_series_items
  for all
  to authenticated
  using (true)
  with check (true);

-- User series progress: user can read/write own rows
create policy user_series_progress_self_rw on public.user_series_progress
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
