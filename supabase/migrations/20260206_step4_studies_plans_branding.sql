-- STEP 4: Bible Studies, Reading Plans, and Branding
-- Run this AFTER step 3

-- ============================================================
-- BIBLE STUDIES - Copy-on-write support
-- ============================================================

-- Add source_study_id to track which study this was copied from
ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS source_study_id UUID;

-- Index for finding source studies
CREATE INDEX IF NOT EXISTS idx_bible_studies_source ON bible_studies(source_study_id);

-- Add source_lesson_id to lessons to track source when copying
ALTER TABLE bible_study_lessons ADD COLUMN IF NOT EXISTS source_lesson_id UUID;

-- Index for finding source lessons
CREATE INDEX IF NOT EXISTS idx_bible_study_lessons_source ON bible_study_lessons(source_lesson_id);

-- ============================================================
-- READING PLANS - Copy-on-write support
-- ============================================================

-- Add source_plan_id to track which plan this was copied from
ALTER TABLE reading_plans ADD COLUMN IF NOT EXISTS source_plan_id UUID;

-- Index for finding source plans
CREATE INDEX IF NOT EXISTS idx_reading_plans_source ON reading_plans(source_plan_id);

-- Add source_day_id to plan days to track source when copying
ALTER TABLE reading_plan_days ADD COLUMN IF NOT EXISTS source_day_id UUID;

-- Index for finding source days
CREATE INDEX IF NOT EXISTS idx_reading_plan_days_source ON reading_plan_days(source_day_id);

-- ============================================================
-- SITE SETTINGS - Branding fields
-- ============================================================

-- Logo URL (custom logo for the organization)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Primary color (hex code, e.g., '#D97706' for amber-600)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS primary_color TEXT;

-- Welcome message (shown on home page)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- Organization display name
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Custom tagline
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tagline TEXT;
