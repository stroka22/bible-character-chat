-- Migration: Add roundtable-related columns to chats
-- Date: 2025-10-07

-- Add conversation_type and participants (jsonb) to chats for roundtables
ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS conversation_type text,
  ADD COLUMN IF NOT EXISTS participants jsonb;

-- Optional simple check constraints (lightweight; nullable permitted)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chats_participants_jsonb'
  ) THEN
    ALTER TABLE public.chats
      ADD CONSTRAINT chats_participants_jsonb CHECK (
        participants IS NULL OR jsonb_typeof(participants) = 'array'
      );
  END IF;
END $$;

-- No changes to RLS needed; existing insert/update policies for owners apply.
