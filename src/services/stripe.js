var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import Stripe from 'stripe';
import { supabase } from './supabase';
// Initialize Stripe with API key from environment variables
var stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
var stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripeSecretKey) {
    console.error('Missing Stripe secret key. Please check your .env file.');
}
// Initialize Stripe client
var stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-06-30.basil', // Use the latest stable API version
});
// Price IDs for different subscription tiers
export var SUBSCRIPTION_PRICES = {
    MONTHLY: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly',
    YEARLY: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_yearly',
};
// Feature flags for subscription tiers
export var PREMIUM_FEATURES = [
    'full_character_library',
    'unlimited_conversations',
    'all_denominations',
    'multi_language',
    'conversation_saving',
    'voice_input_output',
    'ad_free',
];
/**
 * Creates a Stripe customer for a new user
 * @param userId - Supabase user ID
 * @param email - User's email address
 * @returns The Stripe customer ID
 */
export function createCustomer(userId, email) {
    return __awaiter(this, void 0, void 0, function () {
        var userData, customer, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('stripe_customer_id')
                            .eq('id', userId)
                            .single()];
                case 1:
                    userData = (_a.sent()).data;
                    if (userData === null || userData === void 0 ? void 0 : userData.stripe_customer_id) {
                        return [2 /*return*/, userData.stripe_customer_id];
                    }
                    return [4 /*yield*/, stripe.customers.create({
                            email: email,
                            metadata: {
                                userId: userId,
                            },
                        })];
                case 2:
                    customer = _a.sent();
                    // Update user record with Stripe customer ID
                    return [4 /*yield*/, supabase
                            .from('users')
                            .update({ stripe_customer_id: customer.id })
                            .eq('id', userId)];
                case 3:
                    // Update user record with Stripe customer ID
                    _a.sent();
                    return [2 /*return*/, customer.id];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error creating Stripe customer:', error_1);
                    throw new Error('Failed to create customer');
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates a checkout session for subscription purchase
 * @param options - Options for the checkout session
 * @returns The checkout session ID and URL
 */
export function createCheckoutSession(options) {
    return __awaiter(this, void 0, void 0, function () {
        var session, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.checkout.sessions.create({
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
                        })];
                case 1:
                    session = _a.sent();
                    return [2 /*return*/, {
                            id: session.id,
                            url: session.url,
                        }];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error creating checkout session:', error_2);
                    throw new Error('Failed to create checkout session');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Retrieves a user's active subscription
 * @param userId - Supabase user ID
 * @returns The subscription data or null if no active subscription
 */
export function getActiveSubscription(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var userData, subscriptions, subscription, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('stripe_customer_id')
                            .eq('id', userId)
                            .single()];
                case 1:
                    userData = (_a.sent()).data;
                    if (!(userData === null || userData === void 0 ? void 0 : userData.stripe_customer_id)) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, stripe.subscriptions.list({
                            customer: userData.stripe_customer_id,
                            status: 'active',
                            expand: ['data.default_payment_method'],
                        })];
                case 2:
                    subscriptions = _a.sent();
                    if (!subscriptions.data.length) {
                        return [2 /*return*/, null];
                    }
                    subscription = subscriptions.data[0];
                    return [2 /*return*/, {
                            id: subscription.id,
                            customerId: subscription.customer,
                            status: subscription.status,
                            priceId: subscription.items.data[0].price.id,
                            currentPeriodEnd: subscription.current_period_end,
                            cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        }];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error retrieving subscription:', error_3);
                    throw new Error('Failed to retrieve subscription');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Cancels a subscription at the end of the current billing period
 * @param subscriptionId - Stripe subscription ID
 * @returns The updated subscription
 */
export function cancelSubscription(subscriptionId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.subscriptions.update(subscriptionId, {
                            cancel_at_period_end: true,
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error canceling subscription:', error_4);
                    throw new Error('Failed to cancel subscription');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Reactivates a subscription that was set to cancel at period end
 * @param subscriptionId - Stripe subscription ID
 * @returns The updated subscription
 */
export function reactivateSubscription(subscriptionId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.subscriptions.update(subscriptionId, {
                            cancel_at_period_end: false,
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error reactivating subscription:', error_5);
                    throw new Error('Failed to reactivate subscription');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Changes a subscription's plan
 * @param subscriptionId - Stripe subscription ID
 * @param newPriceId - New price ID to switch to
 * @returns The updated subscription
 */
export function changeSubscriptionPlan(subscriptionId, newPriceId) {
    return __awaiter(this, void 0, void 0, function () {
        var subscription, subscriptionItemId, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, stripe.subscriptions.retrieve(subscriptionId)];
                case 1:
                    subscription = _a.sent();
                    subscriptionItemId = subscription.items.data[0].id;
                    return [4 /*yield*/, stripe.subscriptions.update(subscriptionId, {
                            items: [
                                {
                                    id: subscriptionItemId,
                                    price: newPriceId,
                                },
                            ],
                        })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_6 = _a.sent();
                    console.error('Error changing subscription plan:', error_6);
                    throw new Error('Failed to change subscription plan');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates a billing portal session for managing subscriptions
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to return to after the portal session
 * @returns The URL for the billing portal
 */
export function createBillingPortalSession(customerId, returnUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var session, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.billingPortal.sessions.create({
                            customer: customerId,
                            return_url: returnUrl,
                        })];
                case 1:
                    session = _a.sent();
                    return [2 /*return*/, session.url];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error creating billing portal session:', error_7);
                    throw new Error('Failed to create billing portal session');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handles Stripe webhook events
 * @param event - The Stripe event object
 * @returns A response indicating success or failure
 */
export function handleWebhookEvent(event) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, session, userId, subscription, invoice, subscription, subscriptionData, subscription, subscriptionData, subscription, subscriptionData, error_8;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 24, , 25]);
                    _a = event.type;
                    switch (_a) {
                        case 'checkout.session.completed': return [3 /*break*/, 1];
                        case 'invoice.payment_succeeded': return [3 /*break*/, 6];
                        case 'customer.subscription.updated': return [3 /*break*/, 12];
                        case 'customer.subscription.deleted': return [3 /*break*/, 17];
                    }
                    return [3 /*break*/, 22];
                case 1:
                    session = event.data.object;
                    userId = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.userId;
                    if (!userId) {
                        throw new Error('No user ID in session metadata');
                    }
                    if (!(session.subscription && typeof session.subscription === 'string')) return [3 /*break*/, 5];
                    return [4 /*yield*/, stripe.subscriptions.retrieve(session.subscription)];
                case 2:
                    subscription = _c.sent();
                    // Update user subscription status in database
                    return [4 /*yield*/, supabase
                            .from('users')
                            .update({
                            subscription_status: 'active',
                            stripe_subscription_id: subscription.id,
                            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                            .eq('id', userId)];
                case 3:
                    // Update user subscription status in database
                    _c.sent();
                    // Add to subscriptions table
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .insert({
                            user_id: userId,
                            stripe_customer_id: subscription.customer,
                            stripe_subscription_id: subscription.id,
                            status: subscription.status,
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                            price_id: subscription.items.data[0].price.id,
                            product_id: subscription.items.data[0].price.product,
                        })];
                case 4:
                    // Add to subscriptions table
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/, { status: 'success', message: 'Checkout session completed' }];
                case 6:
                    invoice = event.data.object;
                    if (!(invoice.subscription && typeof invoice.subscription === 'string')) return [3 /*break*/, 11];
                    return [4 /*yield*/, stripe.subscriptions.retrieve(invoice.subscription)];
                case 7:
                    subscription = _c.sent();
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .select('user_id')
                            .eq('stripe_subscription_id', subscription.id)
                            .single()];
                case 8:
                    subscriptionData = (_c.sent()).data;
                    if (!subscriptionData) return [3 /*break*/, 11];
                    // Update subscription details
                    return [4 /*yield*/, supabase
                            .from('users')
                            .update({
                            subscription_status: 'active',
                            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                            .eq('id', subscriptionData.user_id)];
                case 9:
                    // Update subscription details
                    _c.sent();
                    // Update subscription record
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .update({
                            status: subscription.status,
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                            .eq('stripe_subscription_id', subscription.id)];
                case 10:
                    // Update subscription record
                    _c.sent();
                    _c.label = 11;
                case 11: return [2 /*return*/, { status: 'success', message: 'Invoice payment succeeded' }];
                case 12:
                    subscription = event.data.object;
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .select('user_id')
                            .eq('stripe_subscription_id', subscription.id)
                            .single()];
                case 13:
                    subscriptionData = (_c.sent()).data;
                    if (!subscriptionData) return [3 /*break*/, 16];
                    // Update subscription details
                    return [4 /*yield*/, supabase
                            .from('users')
                            .update({
                            subscription_status: subscription.status,
                            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                            .eq('id', subscriptionData.user_id)];
                case 14:
                    // Update subscription details
                    _c.sent();
                    // Update subscription record
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .update({
                            status: subscription.status,
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                            .eq('stripe_subscription_id', subscription.id)];
                case 15:
                    // Update subscription record
                    _c.sent();
                    _c.label = 16;
                case 16: return [2 /*return*/, { status: 'success', message: 'Subscription updated' }];
                case 17:
                    subscription = event.data.object;
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .select('user_id')
                            .eq('stripe_subscription_id', subscription.id)
                            .single()];
                case 18:
                    subscriptionData = (_c.sent()).data;
                    if (!subscriptionData) return [3 /*break*/, 21];
                    // Update user subscription status
                    return [4 /*yield*/, supabase
                            .from('users')
                            .update({
                            subscription_status: 'canceled',
                        })
                            .eq('id', subscriptionData.user_id)];
                case 19:
                    // Update user subscription status
                    _c.sent();
                    // Update subscription record
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .update({
                            status: 'canceled',
                        })
                            .eq('stripe_subscription_id', subscription.id)];
                case 20:
                    // Update subscription record
                    _c.sent();
                    _c.label = 21;
                case 21: return [2 /*return*/, { status: 'success', message: 'Subscription deleted' }];
                case 22: return [2 /*return*/, { status: 'ignored', message: "Unhandled event type: ".concat(event.type) }];
                case 23: return [3 /*break*/, 25];
                case 24:
                    error_8 = _c.sent();
                    console.error('Error handling webhook event:', error_8);
                    throw new Error("Failed to handle webhook event: ".concat(error_8 instanceof Error ? error_8.message : 'Unknown error'));
                case 25: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks if a user has access to a premium feature
 * @param userId - Supabase user ID
 * @param feature - The feature to check access for
 * @returns Whether the user has access to the feature
 */
export function hasFeatureAccess(userId, feature) {
    return __awaiter(this, void 0, void 0, function () {
        var FREE_FEATURES, userData, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    FREE_FEATURES = [
                        'basic_characters',
                        'limited_conversations',
                        'basic_denominations',
                        'english_language',
                    ];
                    if (FREE_FEATURES.includes(feature)) {
                        return [2 /*return*/, true];
                    }
                    // Check if feature requires premium
                    if (!PREMIUM_FEATURES.includes(feature)) {
                        console.warn("Unknown feature requested: ".concat(feature));
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('subscription_status, subscription_period_end')
                            .eq('id', userId)
                            .single()];
                case 1:
                    userData = (_a.sent()).data;
                    if (!userData) {
                        return [2 /*return*/, false];
                    }
                    // Check if subscription is active and not expired
                    if (userData.subscription_status === 'active' &&
                        userData.subscription_period_end &&
                        new Date(userData.subscription_period_end) > new Date()) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                case 2:
                    error_9 = _a.sent();
                    console.error('Error checking feature access:', error_9);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Export Stripe public key for frontend use
export var getPublicKey = function () { return stripePublicKey; };
// Export the Stripe instance for direct access if needed
export { stripe };
