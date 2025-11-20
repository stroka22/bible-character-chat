import Stripe from 'stripe';

const { STRIPE_SECRET_KEY } = process.env;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
  try {
    const { customerId } = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!customerId || typeof customerId !== 'string') return res.status(400).json({ error: 'Missing customerId' });
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.items.data.price']
    });
    res.status(200).json({ subscriptions: subs.data || [] });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
