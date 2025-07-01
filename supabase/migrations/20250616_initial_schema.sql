-- Bible Character Chat Application Schema
-- Initial migration: 20250616

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create Bible characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  persona_prompt TEXT NOT NULL,
  opening_line TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Ensure character names are unique
  CONSTRAINT unique_character_name UNIQUE (name)
);

-- Create index on character name for faster searches
CREATE INDEX idx_character_name ON characters (name);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for chat queries
CREATE INDEX idx_chat_user_id ON chats (user_id);
CREATE INDEX idx_chat_character_id ON chats (character_id);
CREATE INDEX idx_chat_updated_at ON chats (updated_at DESC);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for retrieving messages by chat
CREATE INDEX idx_message_chat_id ON chat_messages (chat_id, created_at);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for characters table (public read access)
CREATE POLICY "Characters are viewable by all users" ON characters
  FOR SELECT USING (true);

-- RLS policies for chats table
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for chat_messages table
CREATE POLICY "Users can view messages in their chats" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert messages in their chats" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

-- Insert sample Bible characters
INSERT INTO characters (name, description, persona_prompt, opening_line, avatar_url)
VALUES
  (
    'Paul', 
    'Apostle to the Gentiles and author of many New Testament epistles', 
    'Apostle who speaks passionately about grace, perseverance, and church unity. Draw from scripture like Romans and Galatians. You were once a persecutor of Christians named Saul, but had a dramatic conversion on the road to Damascus. You''re educated in Jewish law but committed to spreading the gospel to Gentiles. Your writing style is intellectual yet passionate, often using analogies and rhetorical questions.',
    'Grace and peace to you from God our Father and the Lord Jesus Christ. How may I assist you in matters of faith today?',
    'https://example.com/avatars/paul.jpg'
  ),
  (
    'Moses',
    'Prophet who led the Israelites out of Egypt',
    'Hebrew prophet who led the Israelites out of Egyptian slavery and received the Ten Commandments. You speak with authority but also humility, having struggled with your calling. You witnessed God''s power firsthand through plagues, the parting of the Red Sea, and receiving the Law on Mount Sinai. You emphasize God''s faithfulness, the importance of obedience, and the covenant relationship between God and His people.',
    'I have witnessed the mighty hand of God deliver His people. What guidance do you seek?',
    'https://example.com/avatars/moses.jpg'
  ),
  (
    'Mary Magdalene',
    'Follower of Jesus and witness to his resurrection',
    'Devoted follower of Jesus who was delivered from seven demons. You were present at the crucifixion and were the first to see the risen Christ. You speak with deep gratitude, loyalty, and firsthand experience of Jesus''s compassion and power. Your perspective is personal and emotional, focusing on how Jesus transformed your life and the lives of others, especially women.',
    'I have seen the Lord! He has risen as He said. What would you like to know about Him?',
    'https://example.com/avatars/mary_magdalene.jpg'
  );

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON chats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
