import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_PORTAL_CONFIGURATION_ID = Deno.env.get('STRIPE_PORTAL_CONFIGURATION_ID') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, apikey, Content-Type, X-Client-Info, X-Supabase-ApiVersion, X-Supabase-Authorization, Accept',
  } as const;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { userId, returnUrl } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Verify the caller and fetch the user's stripe_customer_id securely
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, email, stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('DB error:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    let customerId = profile?.stripe_customer_id || null;
    if (!customerId) {
      // Create a Customer on-the-fly if missing, then persist to the profile
      const customer = await stripe.customers.create({
        email: profile?.email || undefined,
      });
      customerId = customer.id;
      const { error: updErr } = await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
      if (updErr) {
        console.error('Failed to persist stripe_customer_id:', updErr);
      }
    }

    const payload: Record<string, unknown> = {
      customer: customerId,
      return_url:
        typeof returnUrl === 'string' && returnUrl.startsWith('http')
          ? returnUrl
          : req.headers.get('origin') || 'https://faithtalkai.com',
    };

    // If provided, pin to a specific Customer Portal configuration (bpc_...)
    if (STRIPE_PORTAL_CONFIGURATION_ID) {
      payload['configuration'] = STRIPE_PORTAL_CONFIGURATION_ID;
    }

    const session = await stripe.billingPortal.sessions.create(payload as any);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    console.error('create-billing-portal-session error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
