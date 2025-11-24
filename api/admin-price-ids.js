export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const monthly = (process.env.VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY || '').trim();
    const yearly = (process.env.VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY || '').trim();
    const mode = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live_') ? 'live' : 'test';
    const presence = {
      VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY: Boolean(process.env.VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY),
      VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY: Boolean(process.env.VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY),
      STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
    };

    return res.status(200).json({
      monthly: monthly || null,
      yearly: yearly || null,
      mode,
      presence,
    });
  } catch (_e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
