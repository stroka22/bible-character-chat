-- Add weekly_csv_enabled flag for per-admin weekly CSV emails
-- Default true; enforce not null after backfilling existing rows

alter table public.profiles
  add column if not exists weekly_csv_enabled boolean default true;

update public.profiles
  set weekly_csv_enabled = coalesce(weekly_csv_enabled, true)
  where weekly_csv_enabled is null;

alter table public.profiles
  alter column weekly_csv_enabled set not null;
