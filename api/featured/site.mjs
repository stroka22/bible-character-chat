import { createClient } from '@supabase/supabase-js';

// Prefer environment variables on Vercel; fall back to client constants if present
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // Allow only GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const ownerSlug = (req.query.ownerSlug || process.env.VITE_OWNER_SLUG || 'faithtalkai').toString();

    let data, error;
    try {
      ({ data, error } = await supabase
        .from('site_settings')
        .select('default_featured_character_id,enforce_admin_default')
        .eq('owner_slug', ownerSlug)
        .maybeSingle());
      if (error) throw error;
      return res.status(200).json({
        owner_slug: ownerSlug,
        default_featured_character_id: data?.default_featured_character_id || null,
        enforce_admin_default: !!(data?.enforce_admin_default)
      });
    } catch (e) {
      // Graceful fallback when new column is not yet migrated
      if (e && (e.code === '42703' || /column .*enforce_admin_default.* does not exist/i.test(e.message || ''))) {
        const alt = await supabase
          .from('site_settings')
          .select('default_featured_character_id')
          .eq('owner_slug', ownerSlug)
          .maybeSingle();
        if (alt.error) {
          return res.status(500).json({ error: alt.error.message });
        }
        return res.status(200).json({
          owner_slug: ownerSlug,
          default_featured_character_id: alt.data?.default_featured_character_id || null,
          enforce_admin_default: false
        });
      }
      return res.status(500).json({ error: e.message || 'Unknown error' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unknown error' });
  }
}
