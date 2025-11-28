import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as any;

const SUPABASE_URL_RAW = (extra?.supabaseUrl as string) || '';
const SUPABASE_ANON_KEY = (extra?.supabaseAnonKey as string) || '';

function isValidHttpUrl(u: string) {
  try {
    const url = new URL(u);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Guard against placeholders like "${EXPO_PUBLIC_SUPABASE_URL}" or "undefined"
const SUPABASE_URL = (SUPABASE_URL_RAW || '').trim();
const hasValidUrl = isValidHttpUrl(SUPABASE_URL);

if (!hasValidUrl || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error('[mobile] Supabase not configured. Ensure EXPO_PUBLIC_SUPABASE_URL (http/https) and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your EAS environment for the selected profile.');
}

let client: SupabaseClient | null = null;
if (hasValidUrl && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
export const supabase = client as unknown as SupabaseClient;
