-- Migration: Add category management and visibility features to Bible Studies
-- Date: 2026-02-01

-- Create bible_study_categories table (similar to reading_plan_categories)
CREATE TABLE IF NOT EXISTS bible_study_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '',
  description TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to bible_studies table for admin features
DO $$ 
BEGIN
  -- Add is_featured column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bible_studies' AND column_name = 'is_featured') THEN
    ALTER TABLE bible_studies ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add is_visible column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bible_studies' AND column_name = 'is_visible') THEN
    ALTER TABLE bible_studies ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add category column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bible_studies' AND column_name = 'category') THEN
    ALTER TABLE bible_studies ADD COLUMN category TEXT DEFAULT '';
  END IF;
  
  -- Add display_order column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bible_studies' AND column_name = 'display_order') THEN
    ALTER TABLE bible_studies ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bible_studies_is_featured ON bible_studies(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_bible_studies_is_visible ON bible_studies(is_visible);
CREATE INDEX IF NOT EXISTS idx_bible_studies_category ON bible_studies(category);
CREATE INDEX IF NOT EXISTS idx_bible_studies_display_order ON bible_studies(display_order);
CREATE INDEX IF NOT EXISTS idx_bible_study_categories_display_order ON bible_study_categories(display_order);

-- Enable RLS on bible_study_categories
ALTER TABLE bible_study_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for bible_study_categories
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read bible study categories" ON bible_study_categories;
DROP POLICY IF EXISTS "Admins can manage bible study categories" ON bible_study_categories;

-- Anyone can read categories
CREATE POLICY "Anyone can read bible study categories"
  ON bible_study_categories FOR SELECT
  USING (true);

-- Only admins can manage categories (insert, update, delete)
CREATE POLICY "Admins can manage bible study categories"
  ON bible_study_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Insert some default categories
INSERT INTO bible_study_categories (name, slug, icon, description, display_order) VALUES
  ('Foundational', 'foundational', '📖', 'Core Christian beliefs and practices', 0),
  ('Character Studies', 'character', '👤', 'Deep dives into biblical figures', 1),
  ('Topical', 'topical', '💡', 'Studies organized by theme or topic', 2),
  ('Book Studies', 'book', '📚', 'Verse-by-verse exploration of Bible books', 3),
  ('Life Application', 'life', '🌱', 'Practical faith for everyday living', 4),
  ('Seasonal', 'seasonal', '🎄', 'Studies for specific times of year', 5)
ON CONFLICT (slug) DO NOTHING;
