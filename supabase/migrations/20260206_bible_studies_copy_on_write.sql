-- Add source_study_id to bible_studies for copy-on-write tracking
-- This allows orgs to have customized copies of default studies

-- Add source_study_id column to track which study this was copied from
ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS source_study_id UUID REFERENCES bible_studies(id) ON DELETE SET NULL;

-- Index for finding source studies
CREATE INDEX IF NOT EXISTS idx_bible_studies_source ON bible_studies(source_study_id);

-- Similarly for lessons - track source lesson when copying a study
ALTER TABLE bible_study_lessons ADD COLUMN IF NOT EXISTS source_lesson_id UUID REFERENCES bible_study_lessons(id) ON DELETE SET NULL;

-- Index for finding source lessons
CREATE INDEX IF NOT EXISTS idx_bible_study_lessons_source ON bible_study_lessons(source_lesson_id);
