-- =========================================================
-- CONVERSATION PERSISTENCE SCHEMA
-- Bible Character Chat
-- =========================================================
-- This script creates the necessary tables and policies for
-- storing and retrieving user conversations with characters.
-- =========================================================

-- -----------------------------
-- CONVERSATIONS TABLE
-- -----------------------------
-- Stores metadata about each conversation between a user and a character
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    
    -- Additional metadata fields
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    is_shared BOOLEAN NOT NULL DEFAULT false,
    share_code TEXT UNIQUE,
    last_message_preview TEXT
);

COMMENT ON TABLE public.conversations IS 'Stores conversations between users and biblical characters';
COMMENT ON COLUMN public.conversations.title IS 'User-editable title for the conversation';
COMMENT ON COLUMN public.conversations.is_deleted IS 'Soft delete flag to allow conversation recovery';
COMMENT ON COLUMN public.conversations.is_favorite IS 'Whether user has marked this conversation as a favorite';
COMMENT ON COLUMN public.conversations.is_shared IS 'Whether this conversation is shared publicly';
COMMENT ON COLUMN public.conversations.share_code IS 'Unique code for accessing shared conversations';
COMMENT ON COLUMN public.conversations.last_message_preview IS 'Preview of the last message for UI display';

-- -----------------------------
-- MESSAGES TABLE
-- -----------------------------
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    
    -- Additional fields for future features
    metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.messages IS 'Stores individual messages in conversations';
COMMENT ON COLUMN public.messages.role IS 'Message sender: user or assistant (character)';
COMMENT ON COLUMN public.messages.metadata IS 'Additional data like citations, emotions, or formatting';

-- -----------------------------
-- INDEXES
-- -----------------------------
-- For faster queries and sorting

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_character_id ON public.conversations(character_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_is_deleted ON public.conversations(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_conversations_is_favorite ON public.conversations(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_conversations_is_shared ON public.conversations(is_shared) WHERE is_shared = true;

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON public.messages(is_deleted) WHERE is_deleted = false;

-- -----------------------------
-- FUNCTIONS
-- -----------------------------
-- For maintaining timestamps and other automated fields

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation's last_message_preview when a message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Truncate content if it's too long
    UPDATE public.conversations 
    SET 
        last_message_preview = substring(NEW.content, 1, 100),
        updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------
-- TRIGGERS
-- -----------------------------

-- Update timestamps on conversation update
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update last_message_preview when a message is added
DROP TRIGGER IF EXISTS update_conversation_on_message ON public.messages;
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- -----------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------
-- Ensure users can only access their own conversations

-- Enable RLS on tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Clear any existing policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename='conversations' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversations', pol.policyname);
    END LOOP;
    
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename='messages' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', pol.policyname);
    END LOOP;
END $$;

-- Conversations policies
-- Users can select their own conversations
CREATE POLICY conversations_select ON public.conversations 
    FOR SELECT USING (
        auth.uid() = user_id OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor') OR
        is_shared = true
    );

-- Users can insert their own conversations
CREATE POLICY conversations_insert ON public.conversations 
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Users can update their own conversations
CREATE POLICY conversations_update ON public.conversations 
    FOR UPDATE USING (
        auth.uid() = user_id OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
    );

-- Users can delete their own conversations (this sets is_deleted = true)
CREATE POLICY conversations_delete ON public.conversations 
    FOR DELETE USING (
        auth.uid() = user_id OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
    );

-- Messages policies
-- Users can select messages from their conversations or shared conversations
CREATE POLICY messages_select ON public.messages 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.user_id = auth.uid() OR
                (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor') OR
                conversations.is_shared = true
            )
        )
    );

-- Users can insert messages into their own conversations
CREATE POLICY messages_insert ON public.messages 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Users can update messages in their own conversations
CREATE POLICY messages_update ON public.messages 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.user_id = auth.uid() OR
                (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
            )
        )
    );

-- Users can delete messages in their own conversations
CREATE POLICY messages_delete ON public.messages 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.user_id = auth.uid() OR
                (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
            )
        )
    );

-- -----------------------------
-- HELPER FUNCTIONS
-- -----------------------------

-- Function to soft-delete a conversation
CREATE OR REPLACE FUNCTION soft_delete_conversation(conversation_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.conversations
    SET 
        is_deleted = true,
        deleted_at = now()
    WHERE id = conversation_uuid
    AND (
        user_id = auth.uid() OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft-deleted conversation
CREATE OR REPLACE FUNCTION restore_conversation(conversation_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.conversations
    SET 
        is_deleted = false,
        deleted_at = NULL
    WHERE id = conversation_uuid
    AND (
        user_id = auth.uid() OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate a unique share code for a conversation
CREATE OR REPLACE FUNCTION generate_share_code(conversation_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
BEGIN
    -- Generate a random 10-character alphanumeric code
    new_code := substring(md5(random()::text || clock_timestamp()::text), 1, 10);
    
    -- Update the conversation with the new share code and set is_shared to true
    UPDATE public.conversations
    SET 
        share_code = new_code,
        is_shared = true
    WHERE id = conversation_uuid
    AND user_id = auth.uid();
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
