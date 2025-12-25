-- Add study_id and lesson_id to chats table for Bible study conversations
-- This allows filtering Bible study chats from regular conversations

ALTER TABLE chats
  ADD COLUMN IF NOT EXISTS study_id UUID REFERENCES bible_studies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES bible_study_lessons(id) ON DELETE SET NULL;

-- Index for faster queries filtering by study
CREATE INDEX IF NOT EXISTS idx_chats_study_id ON chats (study_id) WHERE study_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chats_lesson_id ON chats (lesson_id) WHERE lesson_id IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN chats.study_id IS 'References the Bible study this conversation belongs to (null for regular chats)';
COMMENT ON COLUMN chats.lesson_id IS 'References the specific lesson within the study (null for regular chats)';
