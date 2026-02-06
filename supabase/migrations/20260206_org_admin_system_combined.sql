-- ============================================================
-- ORG ADMIN SYSTEM - Combined Migration
-- Run this in Supabase SQL Editor to enable org-specific management
-- ============================================================

-- ============================================================
-- 1. CHARACTERS - Copy-on-write support
-- ============================================================

-- Add owner_slug column (default to 'default' for existing characters)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS owner_slug TEXT NOT NULL DEFAULT 'default';

-- Add source_character_id to track which character this was copied from
ALTER TABLE characters ADD COLUMN IF NOT EXISTS source_character_id UUID REFERENCES characters(id) ON DELETE SET NULL;

-- Drop the old unique constraint on name only (if exists)
ALTER TABLE characters DROP CONSTRAINT IF EXISTS unique_character_name;

-- Add new unique constraint: name must be unique within each org
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_character_name_per_org') THEN
    ALTER TABLE characters ADD CONSTRAINT unique_character_name_per_org UNIQUE (owner_slug, name);
  END IF;
END $$;

-- Index for faster org-based lookups
CREATE INDEX IF NOT EXISTS idx_characters_owner_slug ON characters(owner_slug);

-- Index for finding source characters
CREATE INDEX IF NOT EXISTS idx_characters_source ON characters(source_character_id);

-- Update RLS policies for characters

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Characters are viewable by everyone" ON characters;
DROP POLICY IF EXISTS "Admins can insert characters" ON characters;
DROP POLICY IF EXISTS "Admins can update characters" ON characters;
DROP POLICY IF EXISTS "Admins can delete characters" ON characters;
DROP POLICY IF EXISTS "Users can insert characters for their org" ON characters;
DROP POLICY IF EXISTS "Users can update characters for their org" ON characters;
DROP POLICY IF EXISTS "Users can delete their org characters" ON characters;

-- Everyone can view characters (app filters by owner_slug)
CREATE POLICY "Characters are viewable by everyone" ON characters
  FOR SELECT USING (true);

-- Users can insert characters for their own org
CREATE POLICY "Users can insert characters for their org" ON characters
  FOR INSERT WITH CHECK (
    owner_slug = COALESCE(
      (SELECT owner_slug FROM profiles WHERE id = auth.uid()),
      'default'
    )
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

-- Users can update characters for their own org
CREATE POLICY "Users can update characters for their org" ON characters
  FOR UPDATE USING (
    owner_slug = COALESCE(
      (SELECT owner_slug FROM profiles WHERE id = auth.uid()),
      'default'
    )
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

-- Users can delete characters for their own org (not default)
CREATE POLICY "Users can delete their org characters" ON characters
  FOR DELETE USING (
    (
      owner_slug = COALESCE(
        (SELECT owner_slug FROM profiles WHERE id = auth.uid()),
        'default'
      )
      AND owner_slug != 'default'
    )
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

-- ============================================================
-- 2. BIBLE STUDIES - Copy-on-write support
-- ============================================================

-- Add source_study_id to track which study this was copied from
ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS source_study_id UUID REFERENCES bible_studies(id) ON DELETE SET NULL;

-- Index for finding source studies
CREATE INDEX IF NOT EXISTS idx_bible_studies_source ON bible_studies(source_study_id);

-- Add source_lesson_id to lessons to track source when copying
ALTER TABLE bible_study_lessons ADD COLUMN IF NOT EXISTS source_lesson_id UUID REFERENCES bible_study_lessons(id) ON DELETE SET NULL;

-- Index for finding source lessons
CREATE INDEX IF NOT EXISTS idx_bible_study_lessons_source ON bible_study_lessons(source_lesson_id);

-- ============================================================
-- 3. READING PLANS - Copy-on-write support
-- ============================================================

-- Add source_plan_id to track which plan this was copied from
ALTER TABLE reading_plans ADD COLUMN IF NOT EXISTS source_plan_id UUID REFERENCES reading_plans(id) ON DELETE SET NULL;

-- Index for finding source plans
CREATE INDEX IF NOT EXISTS idx_reading_plans_source ON reading_plans(source_plan_id);

-- Add source_day_id to plan days to track source when copying
ALTER TABLE reading_plan_days ADD COLUMN IF NOT EXISTS source_day_id UUID REFERENCES reading_plan_days(id) ON DELETE SET NULL;

-- Index for finding source days
CREATE INDEX IF NOT EXISTS idx_reading_plan_days_source ON reading_plan_days(source_day_id);

-- ============================================================
-- 4. SITE SETTINGS - Branding fields
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

-- ============================================================
-- DONE! 
-- ============================================================
-- The org admin system is now ready. Admins can:
-- - Edit characters (creates org-specific copy via app logic)
-- - Edit Bible studies (creates org-specific copy via app logic)
-- - Edit reading plans (creates org-specific copy via app logic)
-- - Set branding (logo, colors, welcome message)
-- 
-- Superadmins can use "Copy All Content to Org" button to bulk copy.
-- ============================================================
