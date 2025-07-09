import { createClient } from '@supabase/supabase-js';

// =========================================================================
// IMPORTANT: Update these values with your Supabase project information
// =========================================================================

// The URL is constructed using your Supabase project ID
export const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';

// INSTRUCTIONS: Replace this with your actual anon key from Supabase
// To find your anon key:
// 1. Go to https://app.supabase.com and sign in
// 2. Select your project (with ID: sihfbzltlhkerkxozadt)
// 3. Go to Project Settings > API
// 4. Copy the "anon" key (public) - it's safe to use in browser code
// 5. Paste it below between the quotes
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';

// =========================================================================
// Database Types - these should match your Supabase schema
// =========================================================================

// Character type definition
export interface Character {
  id: string;
  name: string;
  description?: string;
  persona?: string;
  greeting?: string;
  avatar_url?: string;
  feature_image_url?: string;
  status?: string;
  bible_book?: string;
  category?: string;
  key_scripture_references?: string;
  is_visible?: boolean;
  timeline_period?: string;
  historical_context?: string;
  geographic_location?: string;
  theological_significance?: string;
  relationships?: Record<string, string[]>;
  study_questions?: string;
  created_at?: string;
  updated_at?: string;
}

// Conversation type definition
export interface Conversation {
  id: string;
  user_id: string;
  character_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  character?: Character;
}

// Chat message type definition
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// User profile type definition
export interface Profile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  role?: 'user' | 'pastor' | 'admin';
  created_at?: string;
  updated_at?: string;
}

// =========================================================================
// Supabase Client Initialization
// =========================================================================

// Initialize the Supabase client with the URL and anon key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================================================================
// Helper Functions
// =========================================================================

/**
 * Checks if the Supabase connection is working
 * @returns A promise that resolves to a boolean indicating if the connection is working
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('characters').select('count');
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

/**
 * Gets the current Supabase configuration for debugging
 * @returns An object with the current Supabase configuration
 */
export function getSupabaseConfig() {
  return {
    url: SUPABASE_URL,
    projectId: SUPABASE_URL.split('https://')[1].split('.')[0],
    hasAnonKey: !!SUPABASE_ANON_KEY,
  };
}
