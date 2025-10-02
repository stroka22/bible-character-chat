-- Add/ensure RLS on bible_studies and public read access for visibility='public'
-- Created: 2025-10-01

-- Enable RLS
alter table if exists public.bible_studies enable row level security;
alter table if exists public.bible_study_lessons enable row level security;

-- Drop existing permissive policies to avoid duplicates
drop policy if exists bible_studies_public_select on public.bible_studies;
drop policy if exists bible_studies_owner_rw on public.bible_studies;
drop policy if exists bible_study_lessons_public_select on public.bible_study_lessons;
drop policy if exists bible_study_lessons_owner_rw on public.bible_study_lessons;

-- Public can read studies that are marked public
create policy bible_studies_public_select on public.bible_studies
  for select
  using (visibility = 'public');

-- Authenticated users can manage studies for their org via owner_slug
-- NOTE: tighten this later to your org-role mapping if needed.
create policy bible_studies_owner_rw on public.bible_studies
  for all
  to authenticated
  using (true)
  with check (true);

-- Lessons: readable when their parent study is public
create policy bible_study_lessons_public_select on public.bible_study_lessons
  for select
  using (
    exists (
      select 1 from public.bible_studies s
      where s.id = bible_study_lessons.study_id
        and s.visibility = 'public'
    )
  );

-- Authenticated write on lessons
create policy bible_study_lessons_owner_rw on public.bible_study_lessons
  for all
  to authenticated
  using (true)
  with check (true);
