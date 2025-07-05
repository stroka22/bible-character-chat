import Stripe from 'stripe';

// --- CONFIGURATION ---
// Get the Stripe secret key from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// --- INITIALIZATION ---
// Check if the secret key is available
if (!STRIPE_SECRET_KEY) {
  console.error('🔴 CRITICAL ERROR: STRIPE_SECRET_KEY is not set in environment variables');
  // Export a handler that returns an error response
  export default function missingKeyHandler(req, res) {
    return res.status(500).json({
      error: 'Server misconfiguration: Stripe secret key is missing',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    });
  }
  // Early return to prevent further execution
  // @ts-ignore
  return;
}

// Initialize Stripe with a specific API version for stability
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Log the Stripe mode (live or test) for debugging
const STRIPE_MODE = STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST';
console.log(`[Stripe Test API] Initialized in ${STRIPE_MODE} mode at ${new Date().toISOString()}`);

/**
 * Simplified Stripe checkout session creation endpoint
 * This is a minimal implementation focused solely on creating a checkout session
 * with detailed logging and error handling.
 * 
 * @param {import('@vercel/node').VercelRequest} req - The request object
 * @param {import('@vercel/node').VercelResponse} res - The response object
 */
export default async function handler(req, res) {
  // --- Request timestamp for logging
  const requestTimestamp = new Date().toISOString();
  console.log(`[Stripe Test API] [${requestTimestamp}] Request received: ${req.method}`);
  
  // --- CORS Headers ---
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[Stripe Test API] [${requestTimestamp}] Handling OPTIONS request`);
    return res.status(204).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`[Stripe Test API] [${requestTimestamp}] Method not allowed: ${req.method}`);
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed',
      allowedMethods: ['POST'],
      timestamp: requestTimestamp
    });
  }
  
  // --- Request Processing ---
  try {
    // Log the request body for debugging
    console.log(`[Stripe Test API] [${requestTimestamp}] Request body:`, 
      JSON.stringify(req.body, null, 2));
    
    // Extract parameters from request body
    const {
      priceId,
      successUrl,
      cancelUrl,
      customerId,
      customerEmail,
      metadata = {}
    } = req.body;
    
    // --- Input Validation ---
    const missingParams = [];
    if (!priceId) missingParams.push('priceId');
    if (!successUrl) missingParams.push('successUrl');
    if (!cancelUrl) missingParams.push('cancelUrl');
    
    if (missingParams.length > 0) {
      const errorMessage = `Missing required parameters: ${missingParams.join(', ')}`;
      console.error(`[Stripe Test API] [${requestTimestamp}] ${errorMessage}`);
      return res.status(400).json({
        error: errorMessage,
        timestamp: requestTimestamp
      });
    }
    
    // --- Environment Consistency Check ---
    // Prevent mixing test prices with live keys and vice versa
    const isTestPrice = priceId.startsWith('price_test_');
    
    if (STRIPE_MODE === 'LIVE' && isTestPrice) {
      const errorMessage = 'Environment mismatch: Cannot use test price ID with live mode';
      console.error(`[Stripe Test API] [${requestTimestamp}] ${errorMessage}`);
      return res.status(400).json({
        error: errorMessage,
        mode: STRIPE_MODE,
        priceIdType: 'test',
        timestamp: requestTimestamp
      });
    }
    
    if (STRIPE_MODE === 'TEST' && !isTestPrice && 
        !priceId.includes('_fallback')) {
      // This is just a warning, not an error
      console.warn(`[Stripe Test API] [${requestTimestamp}] Warning: Using non-test price ID in test mode`);
    }
    
    // --- Create Checkout Session ---
    console.log(`[Stripe Test API] [${requestTimestamp}] Creating checkout session for price: ${priceId}`);
    
    // Add timestamp and debug info to metadata
    const enhancedMetadata = {
      ...metadata,
      created_at: requestTimestamp,
      environment: process.env.NODE_ENV || 'unknown',
      api_version: 'stripe-test-api-v1'
    };
    
    // Create the session with Stripe
    const startTime = Date.now();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      customer: customerId,
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: enhancedMetadata,
      allow_promotion_codes: true
    });
    const endTime = Date.now();
    
    // --- Success Response ---
    if (!session.url) {
      throw new Error('Checkout session created but URL is missing');
    }
    
    console.log(`[Stripe Test API] [${requestTimestamp}] Checkout session created successfully: ${session.id}`);
    console.log(`[Stripe Test API] [${requestTimestamp}] Duration: ${endTime - startTime}ms`);
    
    return res.status(200).json({
      id: session.id,
      url: session.url,
      timestamp: requestTimestamp,
      duration: `${endTime - startTime}ms`
    });
    
  } catch (error) {
    // --- Error Handling ---
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorObject = error instanceof Error ? error : { message: errorMessage };
    
    console.error(`[Stripe Test API] [${requestTimestamp}] Error:`, errorMessage);
    console.error(`[Stripe Test API] [${requestTimestamp}] Stack:`, error instanceof Error ? error.stack : 'No stack trace');
    
    // Determine if this is a Stripe API error
    const isStripeError = error.type && error.type.startsWith('Stripe');
    
    return res.status(500).json({
      error: errorMessage,
      type: isStripeError ? error.type : 'ServerError',
      code: error.code || 'unknown_error',
      param: error.param,
      timestamp: requestTimestamp,
      // Include stack trace in development but not production
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
}
