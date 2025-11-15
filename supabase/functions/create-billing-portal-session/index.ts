import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const { userId, returnUrl } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    // Verify the caller and fetch the user's stripe_customer_id securely
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('DB error:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }
    if (!profile?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No Stripe customer on file' }), { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: typeof returnUrl === 'string' && returnUrl.startsWith('http')
        ? returnUrl
        : req.headers.get('origin') || 'https://faithtalkai.com',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.error('create-billing-portal-session error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});
