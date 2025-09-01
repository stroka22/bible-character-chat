import { 
  generateCharacterResponse,
  streamCharacterResponse,
  formatMessagesForOpenAI
} from './openai.ts';
import * as stripeSafe from './stripe-safe';

console.log('[Services] Using proxy-based OpenAI and safe Stripe services');

export const openai = { 
  generateCharacterResponse,
  streamCharacterResponse,
  formatMessagesForOpenAI
};
export const stripe = stripeSafe;

export { generateCharacterResponse, streamCharacterResponse, formatMessagesForOpenAI };
export const { 
  createCustomer, 
  createCheckoutSession, 
  getActiveSubscription, 
  getPublicKey, 
  testStripeConfiguration, 
  SUBSCRIPTION_PRICES 
} = stripeSafe;

export function checkServiceConfiguration() {
  const openaiEnabled = true; // proxy is server-side; assume configured in env
  const stripeEnabled = Boolean(stripeSafe.stripe) && Object.keys(stripeSafe.stripe).length > 0;
  return { openaiEnabled, stripeEnabled };
}
