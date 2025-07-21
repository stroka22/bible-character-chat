/**
 * Service Importer - Safe Versions
 * 
 * This file imports and re-exports safe versions of our services that gracefully
 * handle missing API keys. Import this file early in the application bootstrap
 * process (e.g., in main.tsx) to ensure these safe versions are used throughout
 * the application.
 */

// Import safe service versions
import * as openaiSafe from './openai-safe';
import * as stripeSafe from './stripe-safe';

// Log that we're using the safe service versions
console.log('[Services] Using safe service versions that gracefully handle missing API keys');

// Re-export with standard service names to be used throughout the app
export const openai = openaiSafe;
export const stripe = stripeSafe;

// Export individual functions from OpenAI service with standard names
export const {
  generateCharacterResponse,
  streamCharacterResponse,
  formatMessagesForOpenAI
} = openaiSafe;

// Export individual functions and constants from Stripe service with standard names
export const {
  createCustomer,
  createCheckoutSession,
  getActiveSubscription,
  getPublicKey,
  testStripeConfiguration,
  SUBSCRIPTION_PRICES
} = stripeSafe;

// Export types
export type { Message, MessageRole } from './openai-safe';
export type { 
  SubscriptionData, 
  CheckoutSessionOptions,
  StripeConfigurationError,
  StripeEndpointError
} from './stripe-safe';

// Export a function to check if services are properly configured
export function checkServiceConfiguration(): {
  openaiEnabled: boolean;
  stripeEnabled: boolean;
} {
  // Check if OpenAI is enabled by looking at the apiKey
  const openaiEnabled = Boolean(openaiSafe.openai);
  
  // Check if Stripe is enabled by looking at the stripe object
  const stripeEnabled = Boolean(stripeSafe.stripe) && 
                        Object.keys(stripeSafe.stripe).length > 0;
  
  return {
    openaiEnabled,
    stripeEnabled
  };
}
