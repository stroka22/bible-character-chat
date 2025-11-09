-- Add optional character_id override per lesson
-- Date: 2025-11-09

do $$
begin
  -- add column if missing
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bible_study_lessons'
      and column_name = 'character_id'
  ) then
    alter table public.bible_study_lessons
      add column character_id uuid references public.characters(id) on delete set null;
  end if;
end $$;

-- no backfill; lessons without an explicit character will inherit the study's character
