-- Normalize owner slugs for bible_studies to canonical 'faithtalkai'
-- Idempotent: safe to run multiple times

-- 1) Standardize existing values to lowercase/trim
update public.bible_studies
set owner_slug = lower(trim(owner_slug))
where owner_slug is not null
  and owner_slug <> lower(trim(owner_slug));

-- 2) Force all non-canonical/empty values to 'faithtalkai'
update public.bible_studies
set owner_slug = 'faithtalkai'
where coalesce(trim(lower(owner_slug)), '') <> 'faithtalkai';

-- Optional: verify result (no-op in migration context)
-- select owner_slug, count(*) from public.bible_studies group by owner_slug;
