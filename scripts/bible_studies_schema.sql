-- =================================================================
-- Bible Studies Schema
-- =================================================================
-- Defines tables for Character-Directed Bible Studies feature
-- Includes:
--   - bible_studies: Main study metadata
--   - bible_study_lessons: Individual lessons within a study
--   - user_study_progress: User progress tracking
--   - ai_outlines: AI-generated study outlines (admin authoring aid)

-- Ensure we have the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =================================================================
-- Main Bible Studies table
-- =================================================================
CREATE TABLE IF NOT EXISTS bible_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_slug text NOT NULL,
  title text NOT NULL,
  description text,
  cover_image_url text,
  -- Link to the guiding character (matches characters.id which is UUID)
  character_id uuid REFERENCES characters(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS bible_studies_owner_slug_idx ON bible_studies(owner_slug);
CREATE INDEX IF NOT EXISTS bible_studies_is_premium_idx ON bible_studies(is_premium);

-- Enable RLS
ALTER TABLE bible_studies ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- Bible Study Lessons table
-- =================================================================
CREATE TABLE IF NOT EXISTS bible_study_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  title text NOT NULL,
  scripture_refs text[] DEFAULT '{}',
  summary text,
  prompts jsonb DEFAULT '[]'::jsonb,
  resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (study_id, order_index)
);

-- Create index
CREATE INDEX IF NOT EXISTS bible_study_lessons_study_id_idx ON bible_study_lessons(study_id);

-- Enable RLS
ALTER TABLE bible_study_lessons ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- User Study Progress table
-- =================================================================
CREATE TABLE IF NOT EXISTS user_study_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  study_id uuid NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  current_lesson_index integer NOT NULL DEFAULT 0,
  completed_lessons integer[] NOT NULL DEFAULT '{}',
  notes jsonb DEFAULT '{}'::jsonb,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, study_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS user_study_progress_user_id_idx ON user_study_progress(user_id);

-- Enable RLS
ALTER TABLE user_study_progress ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- AI Outlines table (admin authoring aid)
-- =================================================================
CREATE TABLE IF NOT EXISTS ai_outlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  outline jsonb NOT NULL,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_outlines ENABLE ROW LEVEL SECURITY;

-- Add explanatory comments
COMMENT ON TABLE bible_studies IS 'Character-directed Bible studies with metadata';
COMMENT ON TABLE bible_study_lessons IS 'Individual lessons within a Bible study';
COMMENT ON TABLE user_study_progress IS 'Tracks user progress through Bible studies';
COMMENT ON TABLE ai_outlines IS 'AI-generated outlines for Bible study authoring (admin tool)';

-- =================================================================
-- Add new columns for subject and character instructions (idempotent)
-- =================================================================
DO $$ BEGIN
  -- Add 'subject' column if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bible_studies' AND column_name = 'subject'
  ) THEN
    ALTER TABLE bible_studies ADD COLUMN subject text;
  END IF;

  -- Add 'character_instructions' column if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bible_studies' AND column_name = 'character_instructions'
  ) THEN
    ALTER TABLE bible_studies ADD COLUMN character_instructions text;
  END IF;
END $$;
