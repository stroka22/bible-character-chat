import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

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
    const { sessionId, userId } = await req.json();
    if (!sessionId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing sessionId or userId' }), { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });
    const customerId = (session.customer as string) || null;
    const sub = session.subscription as any;
    const subscriptionId = sub?.id || null;

    const admin = createClient(supabaseUrl, serviceKey);

    if (customerId) {
      await admin.from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }
    if (subscriptionId && customerId) {
      // optional: upsert to a subscriptions table if present in schema
      try {
        await admin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: sub?.status || 'active',
          current_period_start: sub?.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
          current_period_end: sub?.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
          price_id: sub?.items?.data?.[0]?.price?.id || null,
          product_id: sub?.items?.data?.[0]?.price?.product || null,
        }, { onConflict: 'stripe_subscription_id' });
      } catch (_) {}
    }

    return new Response(JSON.stringify({ ok: true, customerId, subscriptionId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (e) {
    console.error('post-checkout-session error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});
