-- Reading Plans: structured Bible reading programs
-- Date: 2026-01-24

-- Create reading_plans table (stores plan definitions)
create table if not exists public.reading_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  duration_days integer not null,
  category text, -- 'chronological', 'topical', 'book', 'gospel', etc.
  difficulty text default 'medium', -- 'easy', 'medium', 'intensive'
  is_featured boolean default false,
  is_active boolean default true,
  owner_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create reading_plan_days table (daily readings for each plan)
create table if not exists public.reading_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.reading_plans(id) on delete cascade,
  day_number integer not null,
  title text, -- optional day title like "Day 1: Creation"
  readings jsonb not null, -- array of {book, chapter, verses?} objects
  reflection_prompt text, -- optional prompt for journaling/chat
  created_at timestamptz not null default now(),
  unique (plan_id, day_number)
);

-- Create user_reading_plan_progress table (user's progress on plans)
create table if not exists public.user_reading_plan_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.reading_plans(id) on delete cascade,
  start_date date not null default current_date,
  current_day integer not null default 1,
  completed_days jsonb not null default '[]'::jsonb, -- array of completed day numbers
  is_completed boolean default false,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_id)
);

-- Indexes
create index if not exists idx_reading_plans_slug on public.reading_plans(slug);
create index if not exists idx_reading_plans_active on public.reading_plans(is_active);
create index if not exists idx_reading_plan_days_plan on public.reading_plan_days(plan_id);
create index if not exists idx_user_reading_plan_progress_user on public.user_reading_plan_progress(user_id);

-- Updated_at triggers
drop trigger if exists reading_plans_set_updated_at on public.reading_plans;
create trigger reading_plans_set_updated_at
before update on public.reading_plans
for each row execute function public.set_updated_at();

drop trigger if exists user_reading_plan_progress_set_updated_at on public.user_reading_plan_progress;
create trigger user_reading_plan_progress_set_updated_at
before update on public.user_reading_plan_progress
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.reading_plans enable row level security;
alter table public.reading_plan_days enable row level security;
alter table public.user_reading_plan_progress enable row level security;

-- Reading plans: anyone can view active plans
create policy "Anyone can view active reading plans" on public.reading_plans
  for select using (is_active = true);

-- Reading plan days: anyone can view days for active plans
create policy "Anyone can view reading plan days" on public.reading_plan_days
  for select using (
    exists (select 1 from public.reading_plans where id = plan_id and is_active = true)
  );

-- User progress: users can manage their own progress
create policy "Users can view own reading plan progress" on public.user_reading_plan_progress
  for select to authenticated using (user_id = auth.uid());

create policy "Users can insert own reading plan progress" on public.user_reading_plan_progress
  for insert to authenticated with check (user_id = auth.uid());

create policy "Users can update own reading plan progress" on public.user_reading_plan_progress
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete own reading plan progress" on public.user_reading_plan_progress
  for delete to authenticated using (user_id = auth.uid());
