import Stripe from 'stripe';
import { supabase } from './supabase';

// --- Stripe Configuration ---
// Load environment variables for Stripe with fallbacks
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? '';
const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_MONTHLY ?? '';
const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_YEARLY ?? '';
const supabaseProjectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF ?? '';
const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL || 
  (supabaseProjectRef ? `https://${supabaseProjectRef}.functions.supabase.co/create-checkout-session` : null);

// Check if Stripe is properly configured
const STRIPE_ENABLED = Boolean(stripePublicKey);

// Determine Stripe mode (live or test) from the public key
const STRIPE_MODE = stripePublicKey?.startsWith('pk_live_') ? 'live' : 'test';

// Log initialization status with appropriate level
if (STRIPE_ENABLED) {
  console.log(`[Stripe] 🚀 Service initialized in ${STRIPE_MODE.toUpperCase()} mode`);
} else {
  console.warn('[Stripe] ⚠️ Service initialized in DISABLED mode - payment features unavailable');
}

// Check for missing variables but use warnings instead of errors
const missingVars = [];
if (!stripePublicKey) missingVars.push('VITE_STRIPE_PUBLIC_KEY');
if (!monthlyPriceId) missingVars.push('VITE_STRIPE_PRICE_MONTHLY');
if (!yearlyPriceId) missingVars.push('VITE_STRIPE_PRICE_YEARLY');

if (missingVars.length > 0) {
  console.warn(`[Stripe] ⚠️ Missing configuration variables: ${missingVars.join(', ')}`);
  console.warn('[Stripe] Payment features will be disabled. Add these variables to your .env file to enable.');
}

// Only initialize Stripe if we have a valid API key
// Use a dummy object if not configured to prevent runtime errors
const stripe = STRIPE_ENABLED 
  ? new Stripe(stripePublicKey, { apiVersion: '2023-10-16' }) as unknown as Stripe
  : {} as Stripe;

// Export price IDs for use in the application
export const SUBSCRIPTION_PRICES = {
  MONTHLY: monthlyPriceId || 'price_monthly_fallback',
  YEARLY: yearlyPriceId || 'price_yearly_fallback',
};

// --- Interfaces and Types ---
export interface SubscriptionData {
  id: string;
  customerId: string;
  status: string;
  priceId: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutSessionOptions {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

// Custom error types for better error handling
export class StripeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StripeConfigurationError';
  }
}

export class StripeEndpointError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'StripeEndpointError';
  }
}

/**
 * Decide which endpoint to call for creating a Stripe checkout session.
 * Implements a multi-level fallback strategy to ensure reliability.
 */
function getCheckoutEndpoint(preferEdgeFunction = true): string {
  if (!STRIPE_ENABLED) {
    return '/api/create-checkout-session'; // Fallback path
  }
  
  // Option 1: Explicitly configured Edge Function URL
  if (preferEdgeFunction && edgeFunctionUrl && 
      !edgeFunctionUrl.includes('undefined') && 
      edgeFunctionUrl.startsWith('https://')) {
    return edgeFunctionUrl;
  }

  // Option 2: Derived Edge Function URL from project reference
  if (preferEdgeFunction && supabaseProjectRef) {
    return `https://${supabaseProjectRef}.functions.supabase.co/create-checkout-session`;
  }

  // Option 3: Vercel API route (relative URL, handled by same-origin or proxy)
  return '/api/create-checkout-session';
}

/**
 * Creates a Stripe customer for a new user by calling a secure Edge Function.
 * @param userId - Supabase user ID
 * @param email - User's email address
 * @returns The Stripe customer ID
 */
export async function createCustomer(userId: string, email: string): Promise<string> {
  // Check if Stripe is enabled
  if (!STRIPE_ENABLED) {
    console.warn('[Stripe] ⚠️ Cannot create customer - Stripe is not configured');
    return 'stripe_not_configured';
  }

  if (!userId || !email) {
    console.warn('[Stripe] ⚠️ User ID and email are required to create a customer');
    return 'missing_user_info';
  }

  try {
    // First check if the user already has a customer ID
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (dbError) {
      console.warn(`[Stripe] ⚠️ Database error when checking for existing customer: ${dbError.message}`);
      return 'database_error';
    }

    if (userData?.stripe_customer_id) {
      return userData.stripe_customer_id;
    }

    // Call the Edge Function to create a customer
    const response = await supabase.functions.invoke('create-customer', {
      body: { userId, email },
    });

    if (response.error) {
      console.warn(`[Stripe] ⚠️ Edge Function error: ${response.error.message}`);
      return 'edge_function_error';
    }

    if (!response.data?.customerId) {
      console.warn('[Stripe] ⚠️ Edge Function returned no customer ID');
      return 'no_customer_id';
    }

    const customerId = response.data.customerId;

    // Update the user record with the new customer ID
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);

    return customerId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[Stripe] ⚠️ Failed to create customer: ${errorMessage}`);
    return 'customer_creation_failed';
  }
}

/**
 * Creates a checkout session by calling a secure endpoint.
 * @param options - Options for the checkout session
 * @returns The checkout session ID and URL
 */
export async function createCheckoutSession(
  options: CheckoutSessionOptions
): Promise<{ id: string; url: string }> {
  // Check if Stripe is enabled
  if (!STRIPE_ENABLED) {
    console.warn('[Stripe] ⚠️ Cannot create checkout session - Stripe is not configured');
    return { 
      id: 'stripe_not_configured', 
      url: options.cancelUrl || '/' 
    };
  }

  if (!options.priceId || !options.successUrl || !options.cancelUrl) {
    console.warn('[Stripe] ⚠️ Missing required checkout session parameters');
    return { 
      id: 'missing_parameters', 
      url: options.cancelUrl || '/' 
    };
  }

  try {
    const apiRoute = getCheckoutEndpoint(true);
    
    // Retrieve the current auth session
    let accessToken: string | undefined;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      accessToken = session?.access_token;
    } catch (authError) {
      console.warn('[Stripe] ⚠️ Failed to get auth token:', authError);
    }

    // Prepare headers with conditional auth token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Make the API call
    const response = await fetch(apiRoute, {
      method: 'POST',
      headers,
      body: JSON.stringify(options),
    });

    // Handle non-OK responses
    if (!response.ok) {
      console.warn(`[Stripe] ⚠️ Checkout endpoint error: HTTP ${response.status}`);
      return { 
        id: `http_error_${response.status}`, 
        url: options.cancelUrl 
      };
    }

    // Parse the successful response
    const session = await response.json();
    
    if (!session.url) {
      console.warn('[Stripe] ⚠️ Checkout session URL is missing from response');
      return { 
        id: session.id || 'missing_url', 
        url: options.cancelUrl 
      };
    }

    return { id: session.id, url: session.url };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[Stripe] ⚠️ Checkout session creation failed: ${errorMessage}`);
    return { 
      id: 'session_creation_failed', 
      url: options.cancelUrl || '/' 
    };
  }
}

/**
 * Retrieves a user's active subscription by calling a secure Edge Function.
 * @param userId - Supabase user ID
 * @returns The subscription data or null if no active subscription
 */
export async function getActiveSubscription(userId: string): Promise<SubscriptionData | null> {
  // Check if Stripe is enabled
  if (!STRIPE_ENABLED) {
    console.warn('[Stripe] ⚠️ Cannot get subscription - Stripe is not configured');
    return null;
  }
    
  if (!userId) {
    console.warn('[Stripe] ⚠️ User ID is required to get subscription');
    return null;
  }

  try {
    // First get the customer ID from the database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (dbError || !userData?.stripe_customer_id) {
      return null;
    }

    // Call the Edge Function to get subscription data
    const response = await supabase.functions.invoke('get-subscription', {
      body: { customerId: userData.stripe_customer_id },
    });

    if (response.error) {
      console.warn(`[Stripe] ⚠️ Edge Function error: ${response.error.message}`);
      return null;
    }

    const subscriptions = response.data?.subscriptions;
    if (!subscriptions || subscriptions.length === 0) {
      return null;
    }
    
    // Assuming the first subscription is the relevant one
    const sub = subscriptions[0];
    
    return {
      id: sub.id,
      customerId: sub.customer,
      status: sub.status,
      priceId: sub.items.data[0].price.id,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  } catch (error) {
    console.warn(`[Stripe] ⚠️ Failed to retrieve subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Gets the Stripe public key for frontend use.
 * @returns The Stripe public key or a placeholder if not configured.
 */
export function getPublicKey(): string {
  if (!STRIPE_ENABLED) {
    console.warn('[Stripe] ⚠️ Requested public key but Stripe is not configured');
    return 'pk_missing_key';
  }
  return stripePublicKey;
}

/**
 * Tests the Stripe configuration and connectivity.
 * @returns A report of the test results
 */
export async function testStripeConfiguration(): Promise<{
  success: boolean;
  environment: {
    mode: string;
    publicKeyValid: boolean;
    priceIdsValid: boolean;
    edgeFunctionConfigured: boolean;
  };
  endpoints: {
    vercelEndpoint: boolean;
    edgeFunctionEndpoint: boolean;
  };
  message: string;
}> {
  console.log('[Stripe] 🧪 Running configuration test...');
  
  const results = {
    success: false,
    environment: {
      mode: STRIPE_MODE,
      publicKeyValid: STRIPE_ENABLED,
      priceIdsValid: !!monthlyPriceId && !!yearlyPriceId,
      edgeFunctionConfigured: !!edgeFunctionUrl && !edgeFunctionUrl.includes('undefined'),
    },
    endpoints: {
      vercelEndpoint: false,
      edgeFunctionEndpoint: false,
    },
    message: '',
  };

  // If Stripe is not enabled, return early with appropriate message
  if (!STRIPE_ENABLED) {
    results.message = 'Stripe is not configured. Please add API keys to your .env file.';
    console.warn(`[Stripe] ⚠️ ${results.message}`);
    return results;
  }

  if (!results.environment.priceIdsValid) {
    results.message = 'Missing or invalid Stripe price IDs';
    console.warn(`[Stripe] ⚠️ ${results.message}`);
    return results;
  }

  // Test Vercel endpoint
  try {
    const vercelResponse = await fetch('/api/create-checkout-session', {
      method: 'HEAD',
      headers: { 'Content-Type': 'application/json' },
    });
    
    results.endpoints.vercelEndpoint = vercelResponse.status !== 404;
  } catch (error) {
    console.warn('[Stripe] ⚠️ Vercel endpoint check failed:', error);
  }

  // Test Edge Function endpoint if configured
  if (results.environment.edgeFunctionConfigured) {
    try {
      const edgeResponse = await fetch(edgeFunctionUrl!, {
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' },
      });
      
      results.endpoints.edgeFunctionEndpoint = edgeResponse.status === 204 || edgeResponse.status === 200;
    } catch (error) {
      console.warn('[Stripe] ⚠️ Edge Function check failed:', error);
    }
  }

  // Determine overall success
  results.success = results.environment.publicKeyValid && 
                   results.environment.priceIdsValid && 
                   (results.endpoints.vercelEndpoint || results.endpoints.edgeFunctionEndpoint);

  if (results.success) {
    results.message = 'Stripe configuration test passed';
    console.log(`[Stripe] ✅ ${results.message}`);
  } else {
    if (!results.endpoints.vercelEndpoint && !results.endpoints.edgeFunctionEndpoint) {
      results.message = 'No payment endpoints are accessible';
    } else {
      results.message = 'Configuration test failed with partial success';
    }
    console.warn(`[Stripe] ⚠️ ${results.message}`);
  }

  return results;
}

// Export the stripe object for type compatibility where needed.
export { stripe };
