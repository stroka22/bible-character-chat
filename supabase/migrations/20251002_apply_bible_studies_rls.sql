-- Wrapper migration that re-applies bible_studies public visibility policies
-- Created: 2025-10-02

alter table if exists public.bible_studies enable row level security;
alter table if exists public.bible_study_lessons enable row level security;

drop policy if exists bible_studies_public_select on public.bible_studies;
create policy bible_studies_public_select on public.bible_studies
  for select using (visibility = 'public');

drop policy if exists bible_studies_owner_rw on public.bible_studies;
create policy bible_studies_owner_rw on public.bible_studies
  for all to authenticated using (true) with check (true);

drop policy if exists bible_study_lessons_public_select on public.bible_study_lessons;
create policy bible_study_lessons_public_select on public.bible_study_lessons
  for select using (
    exists (
      select 1 from public.bible_studies s
      where s.id = bible_study_lessons.study_id
        and s.visibility = 'public'
    )
  );

drop policy if exists bible_study_lessons_owner_rw on public.bible_study_lessons;
create policy bible_study_lessons_owner_rw on public.bible_study_lessons
  for all to authenticated using (true) with check (true);
