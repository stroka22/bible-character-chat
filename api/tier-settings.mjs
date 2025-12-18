/**
 * Same-origin proxy for tier_settings
 * Bypasses QUIC/HTTP3 issues by routing through Vercel
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';

export default async function handler(req, res) {
  const { method } = req;
  
  // Get auth token from request if present
  const authHeader = req.headers.authorization || '';
  
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  };
  
  // Pass through auth header if present
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    if (method === 'GET') {
      // GET - fetch tier settings
      const ownerSlug = req.query.owner_slug || req.query.ownerSlug;
      let url = `${SUPABASE_URL}/rest/v1/tier_settings?select=*`;
      if (ownerSlug) {
        url += `&owner_slug=eq.${encodeURIComponent(ownerSlug)}`;
      }
      
      const response = await fetch(url, { method: 'GET', headers });
      const data = await response.json();
      return res.status(response.status).json(data);
    }
    
    if (method === 'POST' || method === 'PUT') {
      // POST/PUT - upsert tier settings
      const body = req.body;
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/tier_settings`, {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[tier-settings proxy] Supabase error:', errorText);
        return res.status(response.status).json({ error: errorText });
      }
      
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[tier-settings proxy] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
