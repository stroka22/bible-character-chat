import Stripe from 'stripe';
// Initialize Stripe with an explicit, pinned API version for stability.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Legacy Vercel Serverless Function to create a Stripe Checkout Session.
 * --------------------------------------------------------------------
 * This implementation is maintained for backward-compatibility while the
 * project transitions to Supabase Edge Functions. It securely handles the
 * creation of a checkout session on the server-side, preventing exposure of
 * the Stripe secret key to the client.
 *
 * @param {import('@vercel/node').VercelRequest} req The incoming request object.
 * @param {import('@vercel/node').VercelResponse} res The outgoing response object.
 */
export default async function handler(req, res) {
  // --- CORS Preflight Handling ---
  // Vercel automatically handles OPTIONS requests, but it's good practice to include
  // headers in the actual response for browser compatibility.
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or specify your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const {
      priceId,
      successUrl,
      cancelUrl,
      customerId,
      customerEmail,
      metadata,
    } = req.body;

    // --- Input Validation ---
    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Missing required parameters: priceId, successUrl, and cancelUrl are required.',
      });
    }

    // --- Environment Consistency Check ---
    const isLiveMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');
    const isTestPrice = priceId.startsWith('price_test_');

    if (isLiveMode && isTestPrice) {
      return res.status(400).json({
        error: 'Environment Mismatch: A test price ID was used in live mode. Please use a live price ID.',
      });
    }

    if (!isLiveMode && !isTestPrice) {
        // This is a warning, not a hard error, as live price IDs don't have a specific prefix
        console.warn('🟡 Environment Warning: A non-test price ID was used in test mode.');
    }

    console.log(`Creating checkout session in ${isLiveMode ? 'LIVE' : 'TEST'} mode for price: ${priceId}`);

    // --- Stripe Session Creation ---
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer: customerId,
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error('Failed to create a checkout session URL.');
    }

    console.log(`✅ Checkout session created successfully: ${session.id}`);

    // --- Success Response ---
    return res.status(200).json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    // --- Error Handling ---
    console.error('🔴 Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}
