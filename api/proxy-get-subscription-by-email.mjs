import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/services/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = body.email;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    const url = `${SUPABASE_URL}/functions/v1/get-subscription-by-email`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        // Intentionally omit X-Client-Info to avoid CORS preflight issues
      },
      body: JSON.stringify({ email }),
    });
    const data = await r.json().catch(() => ({}));
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Server error' });
  }
}
