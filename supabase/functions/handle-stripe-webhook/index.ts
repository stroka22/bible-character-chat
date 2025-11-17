import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Environment
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function cors(headers: HeadersInit = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    ...headers,
  } as HeadersInit;
}

async function upsertSubscriptionFromStripe(obj: any, userId?: string) {
  const sub = obj;
  const priceId = sub?.items?.data?.[0]?.price?.id || null;
  const productId = sub?.items?.data?.[0]?.price?.product || null;
  const currentPeriodStart = sub?.current_period_start
    ? new Date(sub.current_period_start * 1000).toISOString()
    : null;
  const currentPeriodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;
  const trialStart = sub?.trial_start
    ? new Date(sub.trial_start * 1000).toISOString()
    : null;
  const trialEnd = sub?.trial_end
    ? new Date(sub.trial_end * 1000).toISOString()
    : null;

  try {
    await admin.from('subscriptions').upsert(
      {
        user_id: userId || null,
        stripe_customer_id: sub?.customer || null,
        stripe_subscription_id: sub?.id || null,
        status: sub?.status || 'active',
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        trial_start: trialStart,
        trial_end: trialEnd,
        price_id: priceId,
        product_id: productId,
      },
      { onConflict: 'stripe_subscription_id' }
    );
  } catch (e) {
    console.error('Failed to upsert subscriptions row', e);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: cors({ 'Content-Type': 'application/json' }),
    });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
      status: 500,
      headers: cors({ 'Content-Type': 'application/json' }),
    });
  }

  const signature = req.headers.get('stripe-signature') || '';
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    // Verify signature using the raw payload
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: cors({ 'Content-Type': 'application/json' }),
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const customerId = session.customer as string | null;
        const subscriptionId = (session.subscription as any)?.id || (typeof session.subscription === 'string' ? session.subscription : null);

        // Try to associate to a user: prefer client_reference_id or metadata.userId
        const userId: string | undefined = session.client_reference_id || session.metadata?.userId || undefined;

        if (customerId && userId) {
          await admin.from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId);
        }

        if (subscriptionId) {
          // Retrieve full subscription for fields
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscriptionFromStripe(sub, userId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;

        // Attempt to find user by customer id
        let userId: string | undefined = undefined;
        try {
          const { data: prof } = await admin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', sub.customer)
            .maybeSingle();
          userId = prof?.id || undefined;
        } catch (_) {}

        await upsertSubscriptionFromStripe(sub, userId);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        // No-op; subscription.updated will carry canonical status, but keep for future use
        break;
      }

      default:
        // Unhandled event types can be safely acknowledged
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: cors({ 'Content-Type': 'application/json' }),
    });
  } catch (e) {
    console.error('Webhook handler error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: cors({ 'Content-Type': 'application/json' }),
    });
  }
});
