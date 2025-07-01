import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string
);

// Define database types for better type safety
export type Character = {
  id: string;
  name: string;
  description: string;
  persona_prompt: string;
  opening_line?: string;
  avatar_url?: string;
  feature_image_url?: string;
  short_biography?: string;
  bible_book?: string;
  scriptural_context?: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
};

export type Chat = {
  id: string;
  user_id: string;
  character_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
};
