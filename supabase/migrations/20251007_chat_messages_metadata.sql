-- Migration: Add metadata column to chat_messages for speaker info, etc.
-- Date: 2025-10-07

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS metadata jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_metadata_jsonb'
  ) THEN
    ALTER TABLE public.chat_messages
      ADD CONSTRAINT chat_messages_metadata_jsonb CHECK (
        metadata IS NULL OR jsonb_typeof(metadata) IN ('object','array','string','number','boolean','null')
      );
  END IF;
END $$;

-- No RLS changes required; follows existing policies.
