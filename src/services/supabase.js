import { createClient } from '@supabase/supabase-js';
// Get environment variables
var supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
var supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
}
// Create Supabase client
export var supabase = createClient(supabaseUrl, supabaseAnonKey);
