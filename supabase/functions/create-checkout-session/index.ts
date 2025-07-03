import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// --- Stripe Initialization ---
// The secret key is retrieved from the environment variables, ensuring it's not exposed in the code.
// This is a critical security measure.
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  console.error('🔴 CRITICAL: Missing STRIPE_SECRET_KEY environment variable.');
  // In a real production environment, you might want to prevent the function from starting.
}

// Determine the current Stripe environment (live or test) based on the secret key prefix.
const STRIPE_MODE = stripeSecretKey?.startsWith('sk_live_') ? 'live' : 'test';
console.log(`🚀 Initializing Stripe in ${STRIPE_MODE.toUpperCase()} mode.`);

// Initialize the Stripe client.
const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-10-16', // Use a specific, stable API version.
  httpClient: Stripe.createFetchHttpClient(),
});

// --- Type Definitions ---
// Defines the expected structure of the JSON body from the client request.
interface CheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

// --- Edge Function Server ---
serve(async (req: Request) => {
  // --- CORS Preflight Handling ---
  // Browsers send an OPTIONS request before a POST request to a different origin.
  // We need to handle this to allow the frontend to communicate with this function.
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // Or specify your frontend domain for better security
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // --- Request Validation ---
    if (req.method !== 'POST') {
      throw new Error('Method Not Allowed');
    }

    const {
      priceId,
      successUrl,
      cancelUrl,
      customerId,
      customerEmail,
      metadata,
    }: CheckoutSessionRequest = await req.json();

    // Validate that essential parameters are provided.
    if (!priceId || !successUrl || !cancelUrl) {
      throw new Error('Missing required parameters: priceId, successUrl, and cancelUrl are required.');
    }
    
    // --- Environment Consistency Check ---
    // This is a crucial validation step to prevent errors from mixing test and live environments.
    const isTestPrice = priceId.startsWith('price_test_');
    if (STRIPE_MODE === 'live' && isTestPrice) {
      throw new Error('Environment Mismatch: A test price ID cannot be used in live mode.');
    }
    if (STRIPE_MODE === 'test' && !isTestPrice) {
      // While not a strict error, this is a strong indicator of a configuration issue.
      console.warn('🟡 Environment Warning: A non-test price ID was used in test mode.');
    }

    console.log(`Creating checkout session for price: ${priceId}`);

    // --- Stripe Session Creation ---
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer: customerId, // Optional: Associates checkout with an existing customer
      customer_email: customerEmail, // Optional: Pre-fills email on checkout page
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata, // Optional: Pass extra info for webhooks
      allow_promotion_codes: true, // Allow users to enter discount codes
    });

    if (!session.url) {
      throw new Error('Failed to create a checkout session URL.');
    }

    console.log(`✅ Checkout session created successfully: ${session.id}`);

    // --- Success Response ---
    return new Response(
      JSON.stringify({
        id: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    // --- Error Handling ---
    console.error('🔴 Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    // Return a structured error response to the client.
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 400, // Bad Request is a common status for client-side errors
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
