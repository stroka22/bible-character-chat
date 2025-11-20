import Stripe from 'stripe';

const { STRIPE_SECRET_KEY } = process.env;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });

  try {
    const { email } = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Missing email' });

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    const customers = await stripe.customers.list({ email, limit: 10 });
    const subsAll = [];
    for (const c of customers.data || []) {
      const subs = await stripe.subscriptions.list({
        customer: c.id,
        status: 'all',
        expand: ['data.items.data.price']
      });
      subsAll.push(...subs.data);
    }
    res.status(200).json({ subscriptions: subsAll });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
