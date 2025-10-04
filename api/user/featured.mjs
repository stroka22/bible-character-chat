import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';

function clientWithAuth(authorization) {
  // Pass through the user's access token so RLS applies as the user
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: authorization ? { Authorization: authorization } : {}
    }
  });
}

export default async function handler(req, res) {
  const { method, headers } = req;
  const authorization = headers['authorization'];

  if (!authorization) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const supabase = clientWithAuth(authorization);

  if (method === 'GET') {
    try {
      // RLS restricts to auth.uid(); single row per user by PK
      const { data, error } = await supabase
        .from('user_settings')
        .select('featured_character_id')
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ featured_character_id: data?.featured_character_id || null });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Unknown error' });
    }
  }

  if (method === 'POST') {
    try {
      const { featured_character_id } = req.body || {};
      const payload = {
        // user_id will be enforced by RLS via auth.uid(); no need to send explicit ID
        featured_character_id: featured_character_id || null,
      };
      const { error } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Unknown error' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
