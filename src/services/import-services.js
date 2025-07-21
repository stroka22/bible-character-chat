import * as openaiSafe from './openai-safe';
import * as stripeSafe from './stripe-safe';
console.log('[Services] Using safe service versions that gracefully handle missing API keys');
export const openai = openaiSafe;
export const stripe = stripeSafe;
export const { generateCharacterResponse, streamCharacterResponse, formatMessagesForOpenAI } = openaiSafe;
export const { createCustomer, createCheckoutSession, getActiveSubscription, getPublicKey, testStripeConfiguration, SUBSCRIPTION_PRICES } = stripeSafe;
export function checkServiceConfiguration() {
    const openaiEnabled = Boolean(openaiSafe.openai);
    const stripeEnabled = Boolean(stripeSafe.stripe) &&
        Object.keys(stripeSafe.stripe).length > 0;
    return {
        openaiEnabled,
        stripeEnabled
    };
}
