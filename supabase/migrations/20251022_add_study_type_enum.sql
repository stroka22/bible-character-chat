-- Add study_type enum and column to bible_studies
-- Safe to run multiple times: create type/column only if missing

do $$
begin
  -- Create enum type if not exists
  if not exists (
    select 1 from pg_type
    where typname = 'study_type_enum'
  ) then
    create type study_type_enum as enum ('standalone', 'introduction');
  end if;

  -- Add column if not exists
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'bible_studies' and column_name = 'study_type'
  ) then
    alter table public.bible_studies
      add column study_type study_type_enum not null default 'standalone';
  end if;
end $$;

-- Optional: backfill nulls just in case (older rows)
update public.bible_studies
set study_type = 'standalone'
where study_type is null;
