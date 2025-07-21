import { createClient } from '@supabase/supabase-js';
export const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('characters').select('count');
        return !error;
    }
    catch (error) {
        console.error('Supabase connection check failed:', error);
        return false;
    }
}
export function getSupabaseConfig() {
    return {
        url: SUPABASE_URL,
        projectId: SUPABASE_URL.split('https://')[1].split('.')[0],
        hasAnonKey: !!SUPABASE_ANON_KEY,
    };
}
