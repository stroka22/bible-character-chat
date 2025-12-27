-- =============================================================================
-- FIX RLS POLICIES AND ORPHAN RECORDS
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Check for orphan records (chats with NULL or wrong user_id)
-- -----------------------------------------------------------------------------

-- View chats with NULL user_id
SELECT id, title, user_id, conversation_type, created_at 
FROM chats 
WHERE user_id IS NULL;

-- View all unique user_ids in chats to see if there are unexpected values
SELECT DISTINCT user_id, COUNT(*) as chat_count 
FROM chats 
GROUP BY user_id 
ORDER BY chat_count DESC;

-- -----------------------------------------------------------------------------
-- STEP 2: Check RLS policies on chats table
-- -----------------------------------------------------------------------------

-- View current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'chats';

-- -----------------------------------------------------------------------------
-- STEP 3: Fix RLS policies for chats table
-- Drop existing policies and create correct ones
-- -----------------------------------------------------------------------------

-- Enable RLS on chats if not already enabled
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
DROP POLICY IF EXISTS "Users can insert own chats" ON chats;
DROP POLICY IF EXISTS "Users can update own chats" ON chats;
DROP POLICY IF EXISTS "Users can delete own chats" ON chats;
DROP POLICY IF EXISTS "chats_select_policy" ON chats;
DROP POLICY IF EXISTS "chats_insert_policy" ON chats;
DROP POLICY IF EXISTS "chats_update_policy" ON chats;
DROP POLICY IF EXISTS "chats_delete_policy" ON chats;

-- Create correct policies
CREATE POLICY "Users can view own chats" ON chats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON chats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON chats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON chats
    FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- STEP 4: Fix RLS policies for chat_messages table
-- -----------------------------------------------------------------------------

-- Enable RLS on chat_messages if not already enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages in own chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in own chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete messages in own chats" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete_policy" ON chat_messages;

-- Create correct policies (join to chats table to check ownership)
CREATE POLICY "Users can view messages in own chats" ON chat_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM chats WHERE chats.id = chat_messages.chat_id AND chats.user_id = auth.uid())
    );

CREATE POLICY "Users can insert messages in own chats" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM chats WHERE chats.id = chat_messages.chat_id AND chats.user_id = auth.uid())
    );

CREATE POLICY "Users can delete messages in own chats" ON chat_messages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM chats WHERE chats.id = chat_messages.chat_id AND chats.user_id = auth.uid())
    );

-- -----------------------------------------------------------------------------
-- STEP 5: Fix RLS policies for user_study_progress table
-- -----------------------------------------------------------------------------

-- Enable RLS on user_study_progress if not already enabled
ALTER TABLE user_study_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own progress" ON user_study_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_study_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_study_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_select_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_insert_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_update_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_delete_policy" ON user_study_progress;

-- Create correct policies
CREATE POLICY "Users can view own progress" ON user_study_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_study_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_study_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON user_study_progress
    FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- STEP 6: Delete orphan chats (chats with NULL user_id)
-- WARNING: This will permanently delete these records!
-- -----------------------------------------------------------------------------

-- First, delete messages for orphan chats
DELETE FROM chat_messages 
WHERE chat_id IN (SELECT id FROM chats WHERE user_id IS NULL);

-- Then delete the orphan chats
DELETE FROM chats WHERE user_id IS NULL;

-- -----------------------------------------------------------------------------
-- STEP 7: Verify fixes
-- -----------------------------------------------------------------------------

-- Check that no orphan chats remain
SELECT COUNT(*) as orphan_chats FROM chats WHERE user_id IS NULL;

-- Check policies are applied
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('chats', 'chat_messages', 'user_study_progress')
ORDER BY tablename, cmd;
