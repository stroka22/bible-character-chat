import Stripe from 'stripe';
import { supabase } from './supabase';

// --- Stripe Configuration ---
// Load environment variables for Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_MONTHLY;
const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_YEARLY;
const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL || 
  `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co/create-checkout-session`;

// Determine Stripe mode (live or test) from the public key
const STRIPE_MODE = stripePublicKey?.startsWith('pk_live_') ? 'live' : 'test';
console.log(`Stripe service initialized in ${STRIPE_MODE.toUpperCase()} mode.`);

// Validate that all required environment variables are set
const missingVars = [];
if (!stripePublicKey) missingVars.push('VITE_STRIPE_PUBLIC_KEY');
if (!monthlyPriceId) missingVars.push('VITE_STRIPE_PRICE_MONTHLY');
if (!yearlyPriceId) missingVars.push('VITE_STRIPE_PRICE_YEARLY');

if (missingVars.length > 0) {
  console.error(`🔴 Missing required Stripe environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
}

// This is a placeholder for TypeScript type compatibility.
// The full Stripe SDK should only be initialized on the server with a secret key.
const stripe: Stripe = {} as Stripe;

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

// --- Client-Side Service Functions ---

/**
 * Creates a Stripe customer for a new user by calling a secure Edge Function.
 * @param userId - Supabase user ID
 * @param email - User's email address
 * @returns The Stripe customer ID
 */
export async function createCustomer(userId: string, email: string): Promise<string> {
  console.log(`Requesting to create Stripe customer for user ${userId}`);
  if (!userId || !email) throw new Error('User ID and email are required to create a customer.');

  try {
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userData?.stripe_customer_id) {
      console.log(`User ${userId} already has Stripe customer ID: ${userData.stripe_customer_id}`);
      return userData.stripe_customer_id;
    }

    const response = await supabase.functions.invoke('create-customer', {
      body: { userId, email },
    });

    if (response.error) throw response.error;
    const customerId = response.data.customerId;
    console.log(`Stripe customer created via Edge Function: ${customerId}`);

    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);

    return customerId;
  } catch (error) {
    console.error('🔴 Error in createCustomer:', error);
    throw new Error(`Failed to create Stripe customer: ${error.message}`);
  }
}

/**
 * Creates a checkout session by calling a secure Edge Function.
 * @param options - Options for the checkout session
 * @returns The checkout session ID and URL
 */
export async function createCheckoutSession(options: CheckoutSessionOptions): Promise<{ id: string; url: string }> {
  console.log('Requesting Stripe checkout session with options:', options);

  // --- Environment Consistency Check ---
  // This check prevents mixing live keys with test prices, which causes 401 errors.
  if (STRIPE_MODE === 'live' && options.priceId.includes('_test_')) {
    const errorMessage = 'Environment Mismatch: A test price ID was used in live mode.';
    console.error(`🔴 ${errorMessage}`);
    throw new Error(errorMessage);
  }
  if (STRIPE_MODE === 'test' && !options.priceId.includes('_test_') && !options.priceId.includes('monthly_fallback') && !options.priceId.includes('yearly_fallback')) {
     // A simple check, as live price IDs don't have a specific prefix
    console.warn('🟡 Environment Warning: A non-test price ID was used in test mode.');
  }
  
  if (!options.priceId || !options.successUrl || !options.cancelUrl) {
    throw new Error('Missing required parameters for checkout session.');
  }

  try {
    console.log(`Calling Edge Function at: ${edgeFunctionUrl}`);
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.getSession()?.data.session?.access_token}`
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const session = await response.json();
    console.log(`✅ Checkout session created successfully: ${session.id}`);
    
    if (!session.url) throw new Error('Checkout session URL is missing from response.');

    return { id: session.id, url: session.url };
  } catch (error) {
    console.error('🔴 Error creating checkout session:', error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
}

/**
 * Retrieves a user's active subscription by calling a secure Edge Function.
 * @param userId - Supabase user ID
 * @returns The subscription data or null if no active subscription
 */
export async function getActiveSubscription(userId: string): Promise<SubscriptionData | null> {
    console.log(`Fetching active subscription for user ${userId}`);
    if (!userId) throw new Error('User ID is required to get subscription.');

    try {
        const { data: userData } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (!userData?.stripe_customer_id) {
            console.log(`No Stripe customer ID found for user ${userId}`);
            return null;
        }

        const response = await supabase.functions.invoke('get-subscription', {
            body: { customerId: userData.stripe_customer_id },
        });

        if (response.error) throw response.error;
        
        const subscriptions = response.data.subscriptions;
        if (!subscriptions || subscriptions.length === 0) {
            console.log(`No active subscriptions found for customer ${userData.stripe_customer_id}`);
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
        console.error('🔴 Error retrieving active subscription:', error);
        throw new Error(`Failed to retrieve subscription: ${error.message}`);
    }
}

/**
 * Gets the Stripe public key for frontend use.
 * @returns The Stripe public key.
 */
export function getPublicKey(): string {
  if (!stripePublicKey) {
    console.error('🔴 CRITICAL: Missing Stripe public key in environment configuration.');
    // Return a placeholder to avoid crashing the app, but checkout will fail.
    return 'pk_missing_key';
  }
  return stripePublicKey;
}

// Export the placeholder stripe object for type compatibility where needed.
export { stripe };
