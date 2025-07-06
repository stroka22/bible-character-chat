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
  /**
   * Indicates whether this character should be displayed to regular users.
   * Admins can toggle this field in the dashboard. Defaults to `true`
   * for backward-compatibility with existing rows that don't yet have
   * the column populated.
   */
  is_visible?: boolean;

  /* ------------------------------------------------------------------
   * Character Insights fields (for the Character Insights Panel)
   * ---------------------------------------------------------------- */

  /** A short label that places the character in biblical history
   *  e.g. "Patriarchs", "United Kingdom", "Exile", "Early Church" */
  timeline_period?: string;

  /** A brief description of the historical / cultural backdrop
   *  in which the character lived (politics, society, key events) */
  historical_context?: string;

  /** Primary geographic location associated with the character
   *  (city, region, or modern-day country) */
  geographic_location?: string;

  /** Comma-separated list of key scripture references
   *  (e.g. "Genesis 37-50; Hebrews 11:22") */
  key_scripture_references?: string;

  /** One-paragraph summary of the character’s theological significance */
  theological_significance?: string;

  /** JSON object containing relationship arrays, e.g.
   *  { "parents": ["Jacob", "Rachel"], "siblings": ["Benjamin"], "spouse": [] } */
  relationships?: Record<string, string[]>;

  /** Optional list of suggested study or reflection questions  */
  study_questions?: string;
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
