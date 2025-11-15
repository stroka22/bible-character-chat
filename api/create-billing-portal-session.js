// Server-side proxy to Supabase Edge Function to avoid browser CORS
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { userId, returnUrl } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Missing Supabase env configuration' });
    }

    const fnUrl = `${SUPABASE_URL}/functions/v1/create-billing-portal-session`;
    const upstream = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({ userId, returnUrl }),
    });

    const text = await upstream.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { error: 'Invalid JSON from edge', raw: text }; }

    return res.status(upstream.status).json(json);
  } catch (err) {
    console.error('[api/create-billing-portal-session] error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
