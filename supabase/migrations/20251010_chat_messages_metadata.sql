-- Migration: Ensure chat_messages.metadata column exists (jsonb)
-- Date: 2025-10-10

-- Add metadata jsonb column to chat_messages if missing
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Optional: lightweight GIN index for metadata queries (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'chat_messages_metadata_idx'
  ) THEN
    CREATE INDEX chat_messages_metadata_idx ON public.chat_messages USING GIN (metadata);
  END IF;
END $$;
