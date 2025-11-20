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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey',
      },
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
    const { customerId } = await req.json();
    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Missing customerId' }), { status: 400 });
    }

    // List active subscriptions for the customer
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.items.data.price']
    });

    return new Response(JSON.stringify({ subscriptions: subs.data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey',
      }
    });
  } catch (e) {
    console.error('get-subscription error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});
