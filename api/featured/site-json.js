import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const ownerSlug = String((req.query && req.query.ownerSlug) || process.env.VITE_OWNER_SLUG || 'faithtalkai');
    const { data, error } = await supabase
      .from('site_settings')
      .select('default_featured_character_id')
      .eq('owner_slug', ownerSlug)
      .maybeSingle();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ owner_slug: ownerSlug, default_featured_character_id: data?.default_featured_character_id || null });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unknown error' });
  }
}
