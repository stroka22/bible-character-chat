import Stripe from 'stripe';
import { supabase } from './supabase';

// --- Stripe Configuration ---
// Load environment variables for Stripe
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
  console.log(`[Stripe] 🚀 Service initialized in ${STRIPE_MODE.toUpperCase()} mode at ${new Date().toISOString()}`);
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
  console.warn('[Stripe] Payment features will be disabled. Add these variables to your .env file to enable payments.');
}

// Only initialize Stripe if we have a valid API key
const stripe: Stripe | null = STRIPE_ENABLED 
  ? new Stripe(stripePublicKey, { apiVersion: '2023-10-16' }) as unknown as Stripe
  : null;

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

// --- Client-Side Service Functions ---

/**
 * Decide which endpoint to call for creating a Stripe checkout session.
 * Implements a multi-level fallback strategy to ensure reliability.
 * 
 * Priority order:
 * 1. Explicitly configured Edge Function URL
 * 2. Derived Edge Function URL from project reference
 * 3. Vercel API route
 * 4. Direct API route
 * 
 * @param preferEdgeFunction Whether to prefer Edge Functions over Vercel (default: true)
 * @returns The best available endpoint URL
 */
function getCheckoutEndpoint(preferEdgeFunction = true): string {
  // Log the available configuration for debugging
  console.log(`[Stripe] 🔍 Endpoint configuration:
  - Edge Function URL: ${edgeFunctionUrl || 'Not configured'}
  - Supabase Project Ref: ${supabaseProjectRef || 'Not configured'}
  - Preference: ${preferEdgeFunction ? 'Edge Function' : 'Vercel Function'}`);

  // Option 1: Explicitly configured Edge Function URL
  if (preferEdgeFunction && edgeFunctionUrl && 
      !edgeFunctionUrl.includes('undefined') && 
      edgeFunctionUrl.startsWith('https://')) {
    console.log(`[Stripe] ✅ Using explicitly configured Edge Function: ${edgeFunctionUrl}`);
    return edgeFunctionUrl;
  }

  // Option 2: Derived Edge Function URL from project reference
  if (preferEdgeFunction && supabaseProjectRef) {
    const derivedUrl = `https://${supabaseProjectRef}.functions.supabase.co/create-checkout-session`;
    console.log(`[Stripe] ✅ Using derived Edge Function URL: ${derivedUrl}`);
    return derivedUrl;
  }

  // Option 3: Vercel API route (relative URL, handled by same-origin or proxy)
  console.log('[Stripe] 🟡 Edge Function not available, falling back to Vercel API route');
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
    throw new StripeConfigurationError('Stripe is not configured. Please add VITE_STRIPE_PUBLIC_KEY to your .env file.');
  }

  console.log(`[Stripe] 📝 Requesting to create customer for user ${userId}`);
  
  if (!userId || !email) {
    const error = 'User ID and email are required to create a customer';
    console.error(`[Stripe] 🔴 ${error}`);
    throw new StripeConfigurationError(error);
  }

  try {
    // First check if the user already has a customer ID
    const { data: userData, error: dbError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (dbError) {
      console.error(`[Stripe] 🔴 Database error when checking for existing customer: ${dbError.message}`);
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (userData?.stripe_customer_id) {
      console.log(`[Stripe] ℹ️ User ${userId} already has Stripe customer ID: ${userData.stripe_customer_id}`);
      return userData.stripe_customer_id;
    }

    console.log(`[Stripe] 🔄 Creating new Stripe customer for user ${userId}`);
    
    // Call the Edge Function to create a customer
    const response = await supabase.functions.invoke('create-customer', {
      body: { userId, email },
    });

    if (response.error) {
      console.error(`[Stripe] 🔴 Edge Function error: ${response.error.message}`);
      throw new StripeEndpointError(`Edge Function error: ${response.error.message}`);
    }

    if (!response.data?.customerId) {
      console.error('[Stripe] 🔴 Edge Function returned no customer ID');
      throw new StripeEndpointError('Edge Function returned no customer ID');
    }

    const customerId = response.data.customerId;
    console.log(`[Stripe] ✅ Customer created successfully: ${customerId}`);

    // Update the user record with the new customer ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);

    if (updateError) {
      console.error(`[Stripe] 🟡 Warning: Could not update user record with customer ID: ${updateError.message}`);
      // Don't throw here, as the customer was created successfully
    }

    return customerId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Stripe] 🔴 Failed to create customer: ${errorMessage}`, error);
    
    // Rethrow with a clear message
    if (error instanceof StripeConfigurationError || error instanceof StripeEndpointError) {
      throw error;
    }
    throw new Error(`Failed to create Stripe customer: ${errorMessage}`);
  }
}

/**
 * Creates a checkout session by calling a secure endpoint.
 * Implements fallback mechanisms between Supabase Edge Functions and Vercel Serverless Functions.
 * 
 * @param options - Options for the checkout session
 * @param attemptNumber - Internal parameter for tracking retry attempts
 * @returns The checkout session ID and URL
 */
export async function createCheckoutSession(
  options: CheckoutSessionOptions, 
  attemptNumber = 1
): Promise<{ id: string; url: string }> {
  // Check if Stripe is enabled
  if (!STRIPE_ENABLED) {
    console.warn('[Stripe] ⚠️ Cannot create checkout session - Stripe is not configured');
    throw new StripeConfigurationError('Stripe is not configured. Please add VITE_STRIPE_PUBLIC_KEY to your .env file.');
  }

  const maxAttempts = 2;
  const timestamp = new Date().toISOString();
  console.log(`[Stripe] 🛒 [${timestamp}] Requesting checkout session (attempt ${attemptNumber}/${maxAttempts})`, options);

  // --- Environment Consistency Check ---
  // This check prevents mixing live keys with test prices, which causes 401 errors.
  if (STRIPE_MODE === 'live' && options.priceId.includes('_test_')) {
    const errorMessage = 'Environment Mismatch: A test price ID was used in live mode.';
    console.error(`[Stripe] 🔴 ${errorMessage}`);
    throw new StripeConfigurationError(errorMessage);
  }
  
  if (STRIPE_MODE === 'test' && 
      !options.priceId.includes('_test_') && 
      !options.priceId.includes('monthly_fallback') && 
      !options.priceId.includes('yearly_fallback')) {
    // A simple check, as live price IDs don't have a specific prefix
    console.warn('[Stripe] 🟡 Environment Warning: A non-test price ID was used in test mode.');
  }
  
  if (!options.priceId || !options.successUrl || !options.cancelUrl) {
    const missing = [];
    if (!options.priceId) missing.push('priceId');
    if (!options.successUrl) missing.push('successUrl');
    if (!options.cancelUrl) missing.push('cancelUrl');
    
    const errorMessage = `Missing required parameters: ${missing.join(', ')}`;
    console.error(`[Stripe] 🔴 ${errorMessage}`);
    throw new StripeConfigurationError(errorMessage);
  }

  try {
    // Try Edge Function first on first attempt, fallback to Vercel on retry
    const preferEdgeFunction = attemptNumber === 1;
    const apiRoute = getCheckoutEndpoint(preferEdgeFunction);
    console.log(`[Stripe] 🔄 Calling checkout endpoint: ${apiRoute}`);

    // Retrieve the current auth session (async) so we can pass the JWT if needed
    let accessToken: string | undefined;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      accessToken = session?.access_token;
      
      if (!accessToken) {
        console.warn('[Stripe] 🟡 No auth token available for request');
      } else {
        console.log('[Stripe] ✅ Auth token retrieved successfully');
      }
    } catch (authError) {
      console.error('[Stripe] 🟡 Failed to get auth token:', authError);
      // Continue without token
    }

    // Prepare headers with conditional auth token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Add debugging headers
    headers['X-Client-Timestamp'] = timestamp;
    headers['X-Client-Mode'] = STRIPE_MODE;
    headers['X-Client-Attempt'] = String(attemptNumber);

    // Make the API call
    const startTime = performance.now();
    const response = await fetch(apiRoute, {
      method: 'POST',
      headers,
      body: JSON.stringify(options),
    });
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.log(`[Stripe] ⏱️ Checkout request completed in ${duration}ms with status ${response.status}`);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: any = { error: `HTTP error ${response.status}` };
      try {
        errorData = await response.json();
      } catch (e) {
        // If we can't parse JSON, use the status text
        errorData = { error: response.statusText || `HTTP error ${response.status}` };
      }

      const errorMessage = errorData.error || `HTTP error ${response.status}`;
      console.error(`[Stripe] 🔴 Checkout endpoint error: ${errorMessage}`);

      // If this was the first attempt using Edge Function, try Vercel Function
      if (attemptNumber < maxAttempts && preferEdgeFunction) {
        console.log('[Stripe] 🔄 Retrying with alternative endpoint...');
        return createCheckoutSession(options, attemptNumber + 1);
      }

      throw new StripeEndpointError(errorMessage, response.status);
    }

    // Parse the successful response
    const session = await response.json();
    console.log(`[Stripe] ✅ Checkout session created: ${session.id}`);
    
    if (!session.url) {
      const error = 'Checkout session URL is missing from response';
      console.error(`[Stripe] 🔴 ${error}`);
      throw new StripeEndpointError(error);
    }

    return { id: session.id, url: session.url };
  } catch (error) {
    // If this is not already a known error type, wrap it
    if (!(error instanceof StripeConfigurationError) && !(error instanceof StripeEndpointError)) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Stripe] 🔴 Checkout session creation failed: ${errorMessage}`, error);
      
      // If we haven't tried all options yet, attempt with the alternative endpoint
      if (attemptNumber < maxAttempts) {
        console.log('[Stripe] 🔄 Error occurred, retrying with alternative endpoint...');
        return createCheckoutSession(options, attemptNumber + 1);
      }
      
      throw new Error(`Failed to create checkout session: ${errorMessage}`);
    }
    
    // Re-throw known error types
    throw error;
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
      return null; // Return null instead of throwing to allow the app to function
    }

    console.log(`[Stripe] 🔍 Fetching active subscription for user ${userId}`);
    
    if (!userId) {
        const error = 'User ID is required to get subscription';
        console.error(`[Stripe] 🔴 ${error}`);
        throw new StripeConfigurationError(error);
    }

    try {
        // First get the customer ID from the database
        const { data: userData, error: dbError } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .maybeSingle();

        if (dbError) {
            console.error(`[Stripe] 🔴 Database error when fetching customer ID: ${dbError.message}`);
            throw new Error(`Database error: ${dbError.message}`);
        }

        if (!userData?.stripe_customer_id) {
            console.log(`[Stripe] ℹ️ No Stripe customer ID found for user ${userId}`);
            return null;
        }

        console.log(`[Stripe] 🔄 Fetching subscriptions for customer ${userData.stripe_customer_id}`);
        
        // Call the Edge Function to get subscription data
        const response = await supabase.functions.invoke('get-subscription', {
            body: { customerId: userData.stripe_customer_id },
        });

        if (response.error) {
            console.error(`[Stripe] 🔴 Edge Function error: ${response.error.message}`);
            throw new StripeEndpointError(`Edge Function error: ${response.error.message}`);
        }

        const subscriptions = response.data?.subscriptions;
        if (!subscriptions || subscriptions.length === 0) {
            console.log(`[Stripe] ℹ️ No active subscriptions found for customer ${userData.stripe_customer_id}`);
            return null;
        }
        
        // Assuming the first subscription is the relevant one
        const sub = subscriptions[0];
        console.log(`[Stripe] ✅ Found active subscription: ${sub.id} (${sub.status})`);
        
        return {
            id: sub.id,
            customerId: sub.customer,
            status: sub.status,
            priceId: sub.items.data[0].price.id,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Stripe] 🔴 Failed to retrieve subscription: ${errorMessage}`, error);
        
        // Rethrow with a clear message
        if (error instanceof StripeConfigurationError || error instanceof StripeEndpointError) {
            throw error;
        }
        throw new Error(`Failed to retrieve subscription: ${errorMessage}`);
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
 * This function can be called to verify that the payment setup is working correctly.
 * 
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

  // Test environment variables
  if (!results.environment.publicKeyValid) {
    results.message = 'Missing or invalid Stripe public key';
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
    
    // Even a 405 Method Not Allowed is OK - it means the endpoint exists
    results.endpoints.vercelEndpoint = vercelResponse.status !== 404;
    console.log(`[Stripe] ${results.endpoints.vercelEndpoint ? '✅' : '❌'} Vercel endpoint check: ${vercelResponse.status}`);
  } catch (error) {
    console.error('[Stripe] 🔴 Vercel endpoint check failed:', error);
  }

  // Test Edge Function endpoint if configured
  if (results.environment.edgeFunctionConfigured) {
    try {
      const edgeResponse = await fetch(edgeFunctionUrl!, {
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' },
      });
      
      results.endpoints.edgeFunctionEndpoint = edgeResponse.status === 204 || edgeResponse.status === 200;
      console.log(`[Stripe] ${results.endpoints.edgeFunctionEndpoint ? '✅' : '❌'} Edge Function check: ${edgeResponse.status}`);
    } catch (error) {
      console.error('[Stripe] 🔴 Edge Function check failed:', error);
    }
  } else {
    console.log('[Stripe] ℹ️ Edge Function not configured, skipping check');
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

// Export the placeholder stripe object for type compatibility where needed.
export { stripe };
