import Stripe from 'stripe';
import { supabase } from './supabase';

// Stripe configuration from environment variables
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? '';
const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_MONTHLY ?? '';
const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_YEARLY ?? '';
const supabaseProjectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF ?? '';
const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL ||
    (supabaseProjectRef ? `https://${supabaseProjectRef}.functions.supabase.co/create-checkout-session` : null);
const STRIPE_ENABLED = Boolean(stripePublicKey);
const STRIPE_MODE = stripePublicKey?.startsWith('pk_live_') ? 'live' : 'test';

if (STRIPE_ENABLED) {
    console.log(`[Stripe] 🚀 Service initialized in ${STRIPE_MODE.toUpperCase()} mode at ${new Date().toISOString()}`);
}
else {
    console.warn('[Stripe] ⚠️ Service initialized in DISABLED mode - payment features unavailable');
}

const missingVars = [];
if (!stripePublicKey)
    missingVars.push('VITE_STRIPE_PUBLIC_KEY');
if (!monthlyPriceId)
    missingVars.push('VITE_STRIPE_PRICE_MONTHLY');
if (!yearlyPriceId)
    missingVars.push('VITE_STRIPE_PRICE_YEARLY');
if (missingVars.length > 0) {
    console.warn(`[Stripe] ⚠️ Missing configuration variables: ${missingVars.join(', ')}`);
    console.warn('[Stripe] Payment features will be disabled. Add these variables to your .env file to enable payments.');
}

const stripe = STRIPE_ENABLED
    ? new Stripe(stripePublicKey, { apiVersion: '2023-10-16' })
    : null;

const SUBSCRIPTION_PRICES = {
    MONTHLY: monthlyPriceId || 'price_monthly_fallback',
    YEARLY: yearlyPriceId || 'price_yearly_fallback',
};

class StripeConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'StripeConfigurationError';
    }
}

class StripeEndpointError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'StripeEndpointError';
    }
}

// Load Stripe.js dynamically to ensure it's available for direct checkout
let stripeJs = null;
async function loadStripeJs() {
    if (stripeJs) return stripeJs;
    
    if (!STRIPE_ENABLED) {
        console.warn('[Stripe] ⚠️ Cannot load Stripe.js - Stripe is not configured');
        return null;
    }
    
    try {
        console.log('[Stripe] 🔄 Loading Stripe.js...');
        // Dynamic import of Stripe.js
        const { loadStripe } = await import('@stripe/stripe-js');
        stripeJs = await loadStripe(stripePublicKey);
        console.log('[Stripe] ✅ Stripe.js loaded successfully');
        return stripeJs;
    } catch (error) {
        console.error('[Stripe] 🔴 Failed to load Stripe.js:', error);
        return null;
    }
}

function getCheckoutEndpoint(preferEdgeFunction = true) {
    console.log(`[Stripe] 🔍 Endpoint configuration:
  - Edge Function URL: ${edgeFunctionUrl || 'Not configured'}
  - Supabase Project Ref: ${supabaseProjectRef || 'Not configured'}
  - Preference: ${preferEdgeFunction ? 'Edge Function' : 'Vercel Function'}`);
    if (preferEdgeFunction && edgeFunctionUrl &&
        !edgeFunctionUrl.includes('undefined') &&
        edgeFunctionUrl.startsWith('https://')) {
        console.log(`[Stripe] ✅ Using explicitly configured Edge Function: ${edgeFunctionUrl}`);
        return edgeFunctionUrl;
    }
    if (preferEdgeFunction && supabaseProjectRef) {
        const derivedUrl = `https://${supabaseProjectRef}.functions.supabase.co/create-checkout-session`;
        console.log(`[Stripe] ✅ Using derived Edge Function URL: ${derivedUrl}`);
        return derivedUrl;
    }
    console.log('[Stripe] 🟡 Edge Function not available, falling back to Vercel API route');
    return '/api/create-checkout-session';
}

async function createCustomer(userId, email) {
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
        const { data: userData, error: dbError } = await supabase
            .from('users')
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
        const { error: updateError } = await supabase
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId);
        if (updateError) {
            console.error(`[Stripe] 🟡 Warning: Could not update user record with customer ID: ${updateError.message}`);
        }
        return customerId;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Stripe] 🔴 Failed to create customer: ${errorMessage}`, error);
        if (error instanceof StripeConfigurationError || error instanceof StripeEndpointError) {
            throw error;
        }
        throw new Error(`Failed to create Stripe customer: ${errorMessage}`);
    }
}

// Direct client-side checkout function - now our primary method
async function createDirectCheckoutSession(options) {
    if (!STRIPE_ENABLED) {
        console.warn('[Stripe] ⚠️ Cannot create direct checkout session - Stripe is not configured');
        throw new StripeConfigurationError('Stripe is not configured. Please add VITE_STRIPE_PUBLIC_KEY to your .env file.');
    }
    
    console.log('[Stripe] 🛒 Creating direct client-side checkout session', options);
    
    // Validate required parameters
    if (!options.priceId || !options.successUrl || !options.cancelUrl) {
        const missing = [];
        if (!options.priceId) missing.push('priceId');
        if (!options.successUrl) missing.push('successUrl');
        if (!options.cancelUrl) missing.push('cancelUrl');
        
        const errorMessage = `Missing required parameters: ${missing.join(', ')}`;
        console.error(`[Stripe] 🔴 ${errorMessage}`);
        throw new StripeConfigurationError(errorMessage);
    }
    
    // Only validate live mode using test prices (ignore test mode warnings)
    if (STRIPE_MODE === 'live' && options.priceId.includes('_test_')) {
        const errorMessage = 'Environment Mismatch: A test price ID was used in live mode.';
        console.error(`[Stripe] 🔴 ${errorMessage}`);
        throw new StripeConfigurationError(errorMessage);
    }
    
    try {
        // Load Stripe.js
        const stripeInstance = await loadStripeJs();
        if (!stripeInstance) {
            throw new Error('Failed to load Stripe.js');
        }
        
        console.log('[Stripe] 🔄 Redirecting to Stripe Checkout...');
        
        // Create and redirect to checkout
        const { error } = await stripeInstance.redirectToCheckout({
            lineItems: [{ price: options.priceId, quantity: 1 }],
            mode: 'subscription',
            successUrl: options.successUrl,
            cancelUrl: options.cancelUrl,
            customerEmail: options.customerEmail,
            clientReferenceId: options.metadata?.userId || ''
        });
        
        if (error) {
            console.error(`[Stripe] 🔴 Redirect to checkout failed: ${error.message}`);
            throw new Error(`Redirect to checkout failed: ${error.message}`);
        }
        
        // Note: This code won't execute immediately as the user is redirected
        console.log('[Stripe] ✅ Redirected to Stripe Checkout');
        return { redirected: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Stripe] 🔴 Direct checkout failed: ${errorMessage}`, error);
        throw new Error(`Direct checkout failed: ${errorMessage}`);
    }
}

// Modified to try direct checkout first, then fall back to server methods
async function createCheckoutSession(options, attemptNumber = 1) {
    if (!STRIPE_ENABLED) {
        console.warn('[Stripe] ⚠️ Cannot create checkout session - Stripe is not configured');
        throw new StripeConfigurationError('Stripe is not configured. Please add VITE_STRIPE_PUBLIC_KEY to your .env file.');
    }
    
    const timestamp = new Date().toISOString();
    console.log(`[Stripe] 🛒 [${timestamp}] Initiating checkout session`, options);
    
    // Validate required parameters
    if (!options.priceId || !options.successUrl || !options.cancelUrl) {
        const missing = [];
        if (!options.priceId) missing.push('priceId');
        if (!options.successUrl) missing.push('successUrl');
        if (!options.cancelUrl) missing.push('cancelUrl');
        
        const errorMessage = `Missing required parameters: ${missing.join(', ')}`;
        console.error(`[Stripe] 🔴 ${errorMessage}`);
        throw new StripeConfigurationError(errorMessage);
    }
    
    // Only validate live mode using test prices (ignore test mode warnings)
    if (STRIPE_MODE === 'live' && options.priceId.includes('_test_')) {
        const errorMessage = 'Environment Mismatch: A test price ID was used in live mode.';
        console.error(`[Stripe] 🔴 ${errorMessage}`);
        throw new StripeConfigurationError(errorMessage);
    }
    
    // Try direct checkout first
    try {
        console.log('[Stripe] 🔄 Attempting direct client-side checkout first...');
        return await createDirectCheckoutSession(options);
    } catch (directError) {
        console.warn(`[Stripe] 🟡 Direct checkout failed, falling back to server methods: ${directError.message}`);
        // Continue to server-side methods if direct checkout fails
    }
    
    // Fall back to server-side methods
    const maxAttempts = 2;
    console.log(`[Stripe] 🔄 Attempting server-side checkout (attempt ${attemptNumber}/${maxAttempts})`);
    
    try {
        const preferEdgeFunction = attemptNumber === 1;
        const apiRoute = getCheckoutEndpoint(preferEdgeFunction);
        console.log(`[Stripe] 🔄 Calling checkout endpoint: ${apiRoute}`);
        
        let accessToken;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            accessToken = session?.access_token;
            if (!accessToken) {
                console.warn('[Stripe] 🟡 No auth token available for request');
            }
            else {
                console.log('[Stripe] ✅ Auth token retrieved successfully');
            }
        }
        catch (authError) {
            console.error('[Stripe] 🟡 Failed to get auth token:', authError);
        }
        
        const headers = {
            'Content-Type': 'application/json',
        };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        headers['X-Client-Timestamp'] = timestamp;
        headers['X-Client-Mode'] = STRIPE_MODE;
        headers['X-Client-Attempt'] = String(attemptNumber);
        
        const startTime = performance.now();
        const response = await fetch(apiRoute, {
            method: 'POST',
            headers,
            body: JSON.stringify(options),
        });
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        console.log(`[Stripe] ⏱️ Checkout request completed in ${duration}ms with status ${response.status}`);
        
        if (!response.ok) {
            let errorData = { error: `HTTP error ${response.status}` };
            try {
                errorData = await response.json();
            }
            catch (e) {
                errorData = { error: response.statusText || `HTTP error ${response.status}` };
            }
            const errorMessage = errorData.error || `HTTP error ${response.status}`;
            console.error(`[Stripe] 🔴 Checkout endpoint error: ${errorMessage}`);
            
            // If first server attempt fails, try the other server endpoint
            if (attemptNumber < maxAttempts) {
                console.log('[Stripe] 🔄 Retrying with alternative server endpoint...');
                return createCheckoutSession(options, attemptNumber + 1);
            }
            
            // If all server attempts fail, try direct checkout again with more aggressive error handling
            console.log('[Stripe] 🔄 All server endpoints failed, trying direct checkout again...');
            try {
                return await createDirectCheckoutSession(options);
            } catch (finalError) {
                console.error('[Stripe] 🔴 All checkout methods failed:', finalError);
                throw new Error(`All checkout methods failed. Last error: ${finalError.message}`);
            }
        }
        
        const session = await response.json();
        console.log(`[Stripe] ✅ Checkout session created: ${session.id}`);
        if (!session.url) {
            const error = 'Checkout session URL is missing from response';
            console.error(`[Stripe] 🔴 ${error}`);
            
            // Try direct checkout as last resort if server response is invalid
            console.log('[Stripe] 🔄 Invalid server response, falling back to direct checkout...');
            return createDirectCheckoutSession(options);
        }
        
        return { id: session.id, url: session.url };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Stripe] 🔴 All checkout methods failed: ${errorMessage}`, error);
        
        // One final attempt at direct checkout if we haven't tried it again already
        if (error.message && !error.message.includes('All checkout methods failed')) {
            console.log('[Stripe] 🔄 Final attempt with direct checkout...');
            try {
                return await createDirectCheckoutSession(options);
            } catch (lastError) {
                console.error('[Stripe] 🔴 Final direct checkout attempt failed:', lastError);
                throw new Error(`All checkout attempts exhausted. Last error: ${lastError.message}`);
            }
        }
        
        throw error;
    }
}

async function getActiveSubscription(userId) {
    if (!STRIPE_ENABLED) {
        console.warn('[Stripe] ⚠️ Cannot get subscription - Stripe is not configured');
        return null;
    }
    console.log(`[Stripe] 🔍 Fetching active subscription for user ${userId}`);
    if (!userId) {
        const error = 'User ID is required to get subscription';
        console.error(`[Stripe] 🔴 ${error}`);
        throw new StripeConfigurationError(error);
    }
    try {
        const { data: userData, error: dbError } = await supabase
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', userId)
            .maybeSingle();
        if (dbError) {
            console.error(`[Stripe] 🔴 Database error when fetching customer ID: ${dbError.message}`);
            throw new Error(`Database error: ${dbError.message}`);
        }
        let subscriptions = [];
        // Try by customer ID first if available
        if (userData?.stripe_customer_id) {
            console.log(`[Stripe] 🔄 Fetching subscriptions for customer ${userData.stripe_customer_id}`);
            const resp = await fetch('/api/stripe-get-subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: userData.stripe_customer_id })
            });
            if (resp.ok) {
                const d = await resp.json();
                subscriptions = d?.subscriptions || [];
            }
        }
        // Fallback by email when none found or no customer id
        if ((!subscriptions || subscriptions.length === 0) && userData?.email) {
            console.log(`[Stripe] 🔄 No subs by customer ID; trying email fallback for ${userData.email}`);
            const r2 = await fetch('/api/stripe-get-subscriptions-by-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.email })
            });
            if (r2.ok) {
                const d2 = await r2.json();
                subscriptions = d2?.subscriptions || [];
            }
        }
        if (!subscriptions || subscriptions.length === 0) {
            console.log('[Stripe] ℹ️ No subscriptions found via customerId or email');
            return null;
        }
        const sub = subscriptions.find(s => ['active','trialing'].includes(s.status)) || subscriptions[0];
        console.log(`[Stripe] ✅ Found active subscription: ${sub.id} (${sub.status})`);
        return {
            id: sub.id,
            customerId: sub.customer,
            status: sub.status,
            priceId: sub.items.data[0].price.id,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Stripe] 🔴 Failed to retrieve subscription: ${errorMessage}`, error);
        if (error instanceof StripeConfigurationError || error instanceof StripeEndpointError) {
            throw error;
        }
        throw new Error(`Failed to retrieve subscription: ${errorMessage}`);
    }
}

function getPublicKey() {
    if (!STRIPE_ENABLED) {
        console.warn('[Stripe] ⚠️ Requested public key but Stripe is not configured');
        return 'pk_missing_key';
    }
    return stripePublicKey;
}

async function testStripeConfiguration() {
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
            directCheckoutAvailable: false,
        },
        message: '',
    };
    
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
    
    // Test direct checkout availability
    try {
        const stripeInstance = await loadStripeJs();
        results.endpoints.directCheckoutAvailable = !!stripeInstance;
        console.log(`[Stripe] ${results.endpoints.directCheckoutAvailable ? '✅' : '❌'} Direct checkout available: ${results.endpoints.directCheckoutAvailable}`);
    } catch (error) {
        console.error('[Stripe] 🔴 Direct checkout check failed:', error);
    }
    
    // Only check server endpoints if direct checkout isn't available
    if (!results.endpoints.directCheckoutAvailable) {
        try {
            const vercelResponse = await fetch('/api/create-checkout-session', {
                method: 'HEAD',
                headers: { 'Content-Type': 'application/json' },
            });
            results.endpoints.vercelEndpoint = vercelResponse.status !== 404;
            console.log(`[Stripe] ${results.endpoints.vercelEndpoint ? '✅' : '❌'} Vercel endpoint check: ${vercelResponse.status}`);
        }
        catch (error) {
            console.error('[Stripe] 🔴 Vercel endpoint check failed:', error);
        }
        
        if (results.environment.edgeFunctionConfigured) {
            try {
                const edgeResponse = await fetch(edgeFunctionUrl, {
                    method: 'OPTIONS',
                    headers: { 'Content-Type': 'application/json' },
                });
                results.endpoints.edgeFunctionEndpoint = edgeResponse.status === 204 || edgeResponse.status === 200;
                console.log(`[Stripe] ${results.endpoints.edgeFunctionEndpoint ? '✅' : '❌'} Edge Function check: ${edgeResponse.status}`);
            }
            catch (error) {
                console.error('[Stripe] 🔴 Edge Function check failed:', error);
            }
        }
        else {
            console.log('[Stripe] ℹ️ Edge Function not configured, skipping check');
        }
    }
    
    results.success = results.environment.publicKeyValid &&
        results.environment.priceIdsValid &&
        (results.endpoints.directCheckoutAvailable || 
         results.endpoints.vercelEndpoint || 
         results.endpoints.edgeFunctionEndpoint);
    
    if (results.success) {
        results.message = 'Stripe configuration test passed';
        console.log(`[Stripe] ✅ ${results.message}`);
    }
    else {
        if (!results.endpoints.directCheckoutAvailable && 
            !results.endpoints.vercelEndpoint && 
            !results.endpoints.edgeFunctionEndpoint) {
            results.message = 'No payment methods are available';
        }
        else {
            results.message = 'Configuration test failed with partial success';
        }
        console.warn(`[Stripe] ⚠️ ${results.message}`);
    }
    
    return results;
}

// Just use regular ESM exports for Vite (browser)
export {
  stripe,
  SUBSCRIPTION_PRICES,
  StripeConfigurationError,
  StripeEndpointError,
  createCustomer,
  createCheckoutSession,
  createDirectCheckoutSession,
  getActiveSubscription,
  getPublicKey,
  testStripeConfiguration,
  loadStripeJs
};
