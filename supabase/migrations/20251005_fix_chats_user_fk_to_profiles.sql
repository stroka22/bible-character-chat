-- Migration: Fix chats.user_id foreign key to reference profiles(id)
-- Date: 2025-10-05

-- Context:
-- The application uses the `profiles` table (linked to auth.users) as the
-- canonical user table. The initial schema referenced `users(id)` from
-- `public.users`, which may be empty, causing FK violations when inserting
-- into `chats`. This migration repoints the foreign key to `profiles(id)`.

-- Safety: make idempotent by checking constraint existence where possible.

DO $$
BEGIN
  -- Drop existing FK if it references the wrong table
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'chats'
      AND tc.constraint_name = 'chats_user_id_fkey'
      AND ccu.table_name <> 'profiles'
  ) THEN
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_user_id_fkey;
  END IF;

  -- Ensure the correct FK exists pointing to profiles(id)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'chats'
      AND tc.constraint_name = 'chats_user_id_fkey'
      AND ccu.table_name = 'profiles'
      AND kcu.column_name = 'user_id'
      AND ccu.column_name = 'id'
  ) THEN
    ALTER TABLE public.chats
      ADD CONSTRAINT chats_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;
