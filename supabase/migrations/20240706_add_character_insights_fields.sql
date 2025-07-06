-- Add character insights fields to the characters table
ALTER TABLE characters
ADD COLUMN timeline_period VARCHAR(255),
ADD COLUMN historical_context TEXT,
ADD COLUMN geographic_location VARCHAR(255),
ADD COLUMN key_scripture_references TEXT,
ADD COLUMN theological_significance TEXT,
ADD COLUMN relationships JSONB,
ADD COLUMN study_questions TEXT;
