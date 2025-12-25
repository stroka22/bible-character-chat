-- User Study Progress: tracks lesson completion and current position
-- Date: 2025-12-21

-- Create the table
create table if not exists public.user_study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  study_id uuid not null references public.bible_studies(id) on delete cascade,
  current_lesson_index integer not null default 0,
  completed_lessons jsonb not null default '[]'::jsonb,
  notes text,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, study_id)
);

-- Index for faster lookups
create index if not exists idx_user_study_progress_user_id on public.user_study_progress(user_id);
create index if not exists idx_user_study_progress_study_id on public.user_study_progress(study_id);

-- Updated_at trigger
drop trigger if exists user_study_progress_set_updated_at on public.user_study_progress;
create trigger user_study_progress_set_updated_at
before update on public.user_study_progress
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.user_study_progress enable row level security;

-- Users can read their own progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_study_progress' AND policyname = 'Users can view own progress'
  ) THEN
    create policy "Users can view own progress" on public.user_study_progress
      for select to authenticated using (user_id = auth.uid());
  END IF;
END $$;

-- Users can insert their own progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_study_progress' AND policyname = 'Users can insert own progress'
  ) THEN
    create policy "Users can insert own progress" on public.user_study_progress
      for insert to authenticated with check (user_id = auth.uid());
  END IF;
END $$;

-- Users can update their own progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_study_progress' AND policyname = 'Users can update own progress'
  ) THEN
    create policy "Users can update own progress" on public.user_study_progress
      for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  END IF;
END $$;

-- Users can delete their own progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_study_progress' AND policyname = 'Users can delete own progress'
  ) THEN
    create policy "Users can delete own progress" on public.user_study_progress
      for delete to authenticated using (user_id = auth.uid());
  END IF;
END $$;
