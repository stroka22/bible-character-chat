import Stripe from 'stripe';
import { supabase } from './supabase';
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? '';
const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_MONTHLY ?? '';
const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_YEARLY ?? '';
const supabaseProjectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF ?? '';
const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL ||
    (supabaseProjectRef ? `https://${supabaseProjectRef}.functions.supabase.co/create-checkout-session` : null);
const STRIPE_ENABLED = Boolean(stripePublicKey);
const STRIPE_MODE = stripePublicKey?.startsWith('pk_live_') ? 'live' : 'test';
if (STRIPE_ENABLED) {
    console.log(`[Stripe] 🚀 Service initialized in ${STRIPE_MODE.toUpperCase()} mode`);
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
    console.warn('[Stripe] Payment features will be disabled. Add these variables to your .env file to enable.');
}
const stripe = STRIPE_ENABLED
    ? new Stripe(stripePublicKey, { apiVersion: '2023-10-16' })
    : {};
export const SUBSCRIPTION_PRICES = {
    MONTHLY: monthlyPriceId || 'price_monthly_fallback',
    YEARLY: yearlyPriceId || 'price_yearly_fallback',
};
export class StripeConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'StripeConfigurationError';
    }
}
export class StripeEndpointError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'StripeEndpointError';
    }
}
function getCheckoutEndpoint(preferEdgeFunction = true) {
    if (!STRIPE_ENABLED) {
        return '/api/create-checkout-session';
    }
    if (preferEdgeFunction && edgeFunctionUrl &&
        !edgeFunctionUrl.includes('undefined') &&
        edgeFunctionUrl.startsWith('https://')) {
        return edgeFunctionUrl;
    }
    if (preferEdgeFunction && supabaseProjectRef) {
        return `https://${supabaseProjectRef}.functions.supabase.co/create-checkout-session`;
    }
    return '/api/create-checkout-session';
}
export async function createCustomer(userId, email) {
    if (!STRIPE_ENABLED) {
        console.warn('[Stripe] ⚠️ Cannot create customer - Stripe is not configured');
        return 'stripe_not_configured';
    }
    if (!userId || !email) {
        console.warn('[Stripe] ⚠️ User ID and email are required to create a customer');
        return 'missing_user_info';
    }
    try {
        const { data: userData, error: dbError } = await supabase
            .from('profiles')
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
        await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId);
        return customerId;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`[Stripe] ⚠️ Failed to create customer: ${errorMessage}`);
        return 'customer_creation_failed';
    }
}
export async function createCheckoutSession(options) {
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
        let accessToken;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            accessToken = session?.access_token;
        }
        catch (authError) {
            console.warn('[Stripe] ⚠️ Failed to get auth token:', authError);
        }
        const headers = {
            'Content-Type': 'application/json',
        };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        const response = await fetch(apiRoute, {
            method: 'POST',
            headers,
            body: JSON.stringify(options),
        });
        if (!response.ok) {
            console.warn(`[Stripe] ⚠️ Checkout endpoint error: HTTP ${response.status}`);
            return {
                id: `http_error_${response.status}`,
                url: options.cancelUrl
            };
        }
        const session = await response.json();
        if (!session.url) {
            console.warn('[Stripe] ⚠️ Checkout session URL is missing from response');
            return {
                id: session.id || 'missing_url',
                url: options.cancelUrl
            };
        }
        return { id: session.id, url: session.url };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`[Stripe] ⚠️ Checkout session creation failed: ${errorMessage}`);
        return {
            id: 'session_creation_failed',
            url: options.cancelUrl || '/'
        };
    }
}
export async function getActiveSubscription(userId) {
    if (!STRIPE_ENABLED) {
        console.warn('[Stripe] ⚠️ Cannot get subscription - Stripe is not configured');
        return null;
    }
    if (!userId) {
        console.warn('[Stripe] ⚠️ User ID is required to get subscription');
        return null;
    }
    try {
        const { data: userData, error: dbError } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .maybeSingle();
        if (dbError || !userData?.stripe_customer_id) {
            return null;
        }
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
        const sub = subscriptions[0];
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
        console.warn(`[Stripe] ⚠️ Failed to retrieve subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
}
export function getPublicKey() {
    if (!STRIPE_ENABLED) {
        console.warn('[Stripe] ⚠️ Requested public key but Stripe is not configured');
        return 'pk_missing_key';
    }
    return stripePublicKey;
}
export async function testStripeConfiguration() {
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
    try {
        const vercelResponse = await fetch('/api/create-checkout-session', {
            method: 'HEAD',
            headers: { 'Content-Type': 'application/json' },
        });
        results.endpoints.vercelEndpoint = vercelResponse.status !== 404;
    }
    catch (error) {
        console.warn('[Stripe] ⚠️ Vercel endpoint check failed:', error);
    }
    if (results.environment.edgeFunctionConfigured) {
        try {
            const edgeResponse = await fetch(edgeFunctionUrl, {
                method: 'OPTIONS',
                headers: { 'Content-Type': 'application/json' },
            });
            results.endpoints.edgeFunctionEndpoint = edgeResponse.status === 204 || edgeResponse.status === 200;
        }
        catch (error) {
            console.warn('[Stripe] ⚠️ Edge Function check failed:', error);
        }
    }
    results.success = results.environment.publicKeyValid &&
        results.environment.priceIdsValid &&
        (results.endpoints.vercelEndpoint || results.endpoints.edgeFunctionEndpoint);
    if (results.success) {
        results.message = 'Stripe configuration test passed';
        console.log(`[Stripe] ✅ ${results.message}`);
    }
    else {
        if (!results.endpoints.vercelEndpoint && !results.endpoints.edgeFunctionEndpoint) {
            results.message = 'No payment endpoints are accessible';
        }
        else {
            results.message = 'Configuration test failed with partial success';
        }
        console.warn(`[Stripe] ⚠️ ${results.message}`);
    }
    return results;
}
export { stripe };
