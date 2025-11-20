import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });
    }

    // Find customers by email (may return multiple; prefer most recently created)
    const customers = await stripe.customers.list({ email, limit: 10 });
    if (!customers.data || customers.data.length === 0) {
      return new Response(JSON.stringify({ subscriptions: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Sort by created desc
    const sorted = [...customers.data].sort((a, b) => (b.created || 0) - (a.created || 0));

    // Accumulate subscriptions across possible customers
    const subsAll: any[] = [];
    for (const c of sorted) {
      const subs = await stripe.subscriptions.list({
        customer: c.id,
        status: 'all',
        expand: ['data.items.data.price'],
      });
      subsAll.push(...subs.data);
    }

    return new Response(JSON.stringify({ subscriptions: subsAll }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.error('get-subscription-by-email error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});
