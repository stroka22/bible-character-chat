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
    const customerId = body.customerId;
    if (!customerId) {
      res.status(400).json({ error: 'Missing customerId' });
      return;
    }
    const url = `${SUPABASE_URL}/functions/v1/get-subscription`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ customerId }),
    });
    const data = await r.json().catch(() => ({}));
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Server error' });
  }
}
