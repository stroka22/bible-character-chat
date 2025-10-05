-- Migration: Public share for conversations (chats)
-- Date: 2025-10-05

-- 1) Add sharing columns to chats
ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS is_shared boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_code text;

-- Unique share_code (nullable unique indexes allow multiple NULLs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'chats_share_code_key'
  ) THEN
    CREATE UNIQUE INDEX chats_share_code_key ON public.chats(share_code);
  END IF;
END $$;

-- 2) RLS policies to allow anonymous read of shared conversations
--    NOTE: This allows reading any shared chat by ID; the client uses
--          share_code to fetch, but policy is intentionally simple.

-- Chats SELECT when shared
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chats' AND policyname = 'Shared chats are viewable by all'
  ) THEN
    CREATE POLICY "Shared chats are viewable by all" ON public.chats
      FOR SELECT USING (is_shared = true);
  END IF;
END $$;

-- Chat messages SELECT when parent chat is shared
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Messages readable for shared chats'
  ) THEN
    CREATE POLICY "Messages readable for shared chats" ON public.chat_messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.chats c
          WHERE c.id = chat_messages.chat_id
            AND c.is_shared = true
        )
      );
  END IF;
END $$;
