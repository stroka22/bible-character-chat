-- Add premium gating fields to tier_settings for per-organization controls
-- Safe to run multiple times: use IF NOT EXISTS guards

-- premium_roundtable_gates stores an object like:
-- {
--   "allowAllSpeak": true|false,
--   "strictRotation": true|false,
--   "followUpsMin": number | null,
--   "repliesPerRoundMin": number | null
-- }
-- A value of true (for booleans) means the feature requires premium.
-- A number (for *_Min) means values greater than this threshold require premium.

alter table if exists public.tier_settings
  add column if not exists premium_roundtable_gates jsonb not null default '{}'::jsonb;

-- premium_study_ids stores an array of study UUIDs that require premium for this org
alter table if exists public.tier_settings
  add column if not exists premium_study_ids jsonb not null default '[]'::jsonb;

-- Backfill updated_at
update public.tier_settings set updated_at = now() where updated_at is null;

comment on column public.tier_settings.premium_roundtable_gates is
  'Per-org premium gates for roundtable features (JSON object: allowAllSpeak, strictRotation, followUpsMin, repliesPerRoundMin)';

comment on column public.tier_settings.premium_study_ids is
  'Array of bible_studies.id that require premium for this organization';
