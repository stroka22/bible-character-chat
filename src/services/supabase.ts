import { createClient } from '@supabase/supabase-js';

// =========================================================================
// IMPORTANT: Update these values with your Supabase project information
// =========================================================================

/* -----------------------------------------------------------------------
 * Environment helpers – prefer Vite env (import.meta.env.*) but also check
 * Node‐style process.env so the same file works in SSR / tests.
 * --------------------------------------------------------------------- */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const ENV_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ??
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (typeof process !== 'undefined' ? (process as any).env?.VITE_SUPABASE_URL : undefined);

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const ENV_ANON =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ??
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (typeof process !== 'undefined' ? (process as any).env?.VITE_SUPABASE_ANON_KEY : undefined);

// ---------------------------------------------------------------------------
// Hardened env handling
//   • If BOTH env vars present  → use them
//   • If NEITHER present       → use hard-coded fallbacks (dev/demo)
//   • If only ONE present       → log error, use placeholder strings so the
//                                failure is obvious (avoid mixing pairs)
// ---------------------------------------------------------------------------

const hasEnvUrl = !!ENV_URL;
const hasEnvAnon = !!ENV_ANON;

let resolvedUrl: string;
let resolvedAnon: string;

if (hasEnvUrl && hasEnvAnon) {
  // Fully-specified via env
  resolvedUrl = ENV_URL as string;
  resolvedAnon = ENV_ANON as string;
} else if (!hasEnvUrl && !hasEnvAnon) {
  // Dev fallback
  resolvedUrl = 'https://sihfbzltlhkerkxozadt.supabase.co';
  resolvedAnon =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Using bundled fallback credentials (dev/demo only). ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production.',
  );
} else {
  // Partial config – hard fail loudly
  resolvedUrl = ENV_URL || 'MISSING_ENV_SUPABASE_URL';
  resolvedAnon = ENV_ANON || 'MISSING_ENV_SUPABASE_ANON_KEY';
  // eslint-disable-next-line no-console
  console.error(
    '[supabase] Incomplete Supabase environment configuration. ' +
      'Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. ' +
      'Falling back to placeholder values – API calls will fail with 401.',
  );
}

export const SUPABASE_URL = resolvedUrl;
export const SUPABASE_ANON_KEY = resolvedAnon;

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

// Warn developers when fallback credentials are being used
if (!ENV_URL || !ENV_ANON) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Using fallback Supabase credentials. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env.',
  );
}

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
