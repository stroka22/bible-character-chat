import Stripe from 'stripe';
import { supabase } from './supabase';

// Initialize Stripe with API key from environment variables
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripeSecretKey) {
  console.error('Missing Stripe secret key. Please check your .env file.');
}

// Initialize Stripe client
const stripe = new Stripe(stripeSecretKey as string, {
  apiVersion: '2023-10-16', // Use the latest stable API version
});

// Price IDs for different subscription tiers
export const SUBSCRIPTION_PRICES = {
  MONTHLY: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly',
  YEARLY: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_yearly',
};

// Feature flags for subscription tiers
export const PREMIUM_FEATURES = [
  'full_character_library',
  'unlimited_conversations',
  'all_denominations',
  'multi_language',
  'conversation_saving',
  'voice_input_output',
  'ad_free',
];

// Types for Stripe-related data
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

/**
 * Creates a Stripe customer for a new user
 * @param userId - Supabase user ID
 * @param email - User's email address
 * @returns The Stripe customer ID
 */
export async function createCustomer(userId: string, email: string): Promise<string> {
  try {
    // Check if customer already exists
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userData?.stripe_customer_id) {
      return userData.stripe_customer_id;
    }

    // Create new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    // Update user record with Stripe customer ID
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Creates a checkout session for subscription purchase
 * @param options - Options for the checkout session
 * @returns The checkout session ID and URL
 */
export async function createCheckoutSession(options: CheckoutSessionOptions): Promise<{ id: string; url: string }> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: options.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer: options.customerId,
      customer_email: options.customerEmail,
      metadata: options.metadata,
      allow_promotion_codes: true,
    });

    return {
      id: session.id,
      url: session.url as string,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Retrieves a user's active subscription
 * @param userId - Supabase user ID
 * @returns The subscription data or null if no active subscription
 */
export async function getActiveSubscription(userId: string): Promise<SubscriptionData | null> {
  try {
    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!userData?.stripe_customer_id) {
      return null;
    }

    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    if (!subscriptions.data.length) {
      return null;
    }

    const subscription = subscriptions.data[0];

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw new Error('Failed to retrieve subscription');
  }
}

/**
 * Cancels a subscription at the end of the current billing period
 * @param subscriptionId - Stripe subscription ID
 * @returns The updated subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Reactivates a subscription that was set to cancel at period end
 * @param subscriptionId - Stripe subscription ID
 * @returns The updated subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw new Error('Failed to reactivate subscription');
  }
}

/**
 * Changes a subscription's plan
 * @param subscriptionId - Stripe subscription ID
 * @param newPriceId - New price ID to switch to
 * @returns The updated subscription
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItemId = subscription.items.data[0].id;

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionItemId,
          price: newPriceId,
        },
      ],
    });
  } catch (error) {
    console.error('Error changing subscription plan:', error);
    throw new Error('Failed to change subscription plan');
  }
}

/**
 * Creates a billing portal session for managing subscriptions
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to return to after the portal session
 * @returns The URL for the billing portal
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw new Error('Failed to create billing portal session');
  }
}

/**
 * Handles Stripe webhook events
 * @param event - The Stripe event object
 * @returns A response indicating success or failure
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<{ status: string; message: string }> {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract the user ID from metadata
        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error('No user ID in session metadata');
        }

        // Get subscription details
        if (session.subscription && typeof session.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          // Update user subscription status in database
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              stripe_subscription_id: subscription.id,
              subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId);
          
          // Add to subscriptions table
          await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              price_id: subscription.items.data[0].price.id,
              product_id: subscription.items.data[0].price.product as string,
            });
        }
        
        return { status: 'success', message: 'Checkout session completed' };
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          
          // Find the user with this subscription
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single();
          
          if (subscriptionData) {
            // Update subscription details
            await supabase
              .from('users')
              .update({
                subscription_status: 'active',
                subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('id', subscriptionData.user_id);
            
            // Update subscription record
            await supabase
              .from('subscriptions')
              .update({
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('stripe_subscription_id', subscription.id);
          }
        }
        
        return { status: 'success', message: 'Invoice payment succeeded' };
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (subscriptionData) {
          // Update subscription details
          await supabase
            .from('users')
            .update({
              subscription_status: subscription.status,
              subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', subscriptionData.user_id);
          
          // Update subscription record
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        
        return { status: 'success', message: 'Subscription updated' };
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (subscriptionData) {
          // Update user subscription status
          await supabase
            .from('users')
            .update({
              subscription_status: 'canceled',
            })
            .eq('id', subscriptionData.user_id);
          
          // Update subscription record
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        
        return { status: 'success', message: 'Subscription deleted' };
      }
      
      default:
        return { status: 'ignored', message: `Unhandled event type: ${event.type}` };
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw new Error(`Failed to handle webhook event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Checks if a user has access to a premium feature
 * @param userId - Supabase user ID
 * @param feature - The feature to check access for
 * @returns Whether the user has access to the feature
 */
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  try {
    // Free features are available to everyone
    const FREE_FEATURES = [
      'basic_characters',
      'limited_conversations',
      'basic_denominations',
      'english_language',
    ];
    
    if (FREE_FEATURES.includes(feature)) {
      return true;
    }
    
    // Check if feature requires premium
    if (!PREMIUM_FEATURES.includes(feature)) {
      console.warn(`Unknown feature requested: ${feature}`);
      return false;
    }
    
    // Get user's subscription status
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_status, subscription_period_end')
      .eq('id', userId)
      .single();
    
    if (!userData) {
      return false;
    }
    
    // Check if subscription is active and not expired
    if (
      userData.subscription_status === 'active' &&
      userData.subscription_period_end &&
      new Date(userData.subscription_period_end) > new Date()
    ) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

// Export Stripe public key for frontend use
export const getPublicKey = (): string => stripePublicKey as string;

// Export the Stripe instance for direct access if needed
export { stripe };
