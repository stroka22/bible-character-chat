import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe
import { useAuth } from '../contexts/AuthContext';
import { getPublicKey, createCheckoutSession, SUBSCRIPTION_PRICES, PREMIUM_FEATURES } from '../services/stripe'; // Import necessary Stripe functions

// Initialize Stripe outside of component render to avoid re-creating it
const stripePromise = loadStripe(getPublicKey());

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly'); // State for billing period

  // Determine the price based on the selected billing period
  const selectedPriceId = billingPeriod === 'monthly' ? SUBSCRIPTION_PRICES.MONTHLY : SUBSCRIPTION_PRICES.YEARLY;
  const displayPrice = billingPeriod === 'monthly' ? '$9.97' : '$97.97';
  const displayPeriod = billingPeriod === 'monthly' ? '/month' : '/year';

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js failed to load.');
      }

      if (!user) {
        alert('Please log in to subscribe.');
        return;
      }

      const session = await createCheckoutSession({
        priceId: selectedPriceId,
        successUrl: window.location.origin + '/conversations?checkout=success', // Redirect to conversations on success
        cancelUrl: window.location.origin + '/pricing?checkout=canceled', // Return to pricing on cancel
        customerId: user.id, // Pass Supabase user ID as customer ID
        customerEmail: user.email, // Pass user email
        metadata: {
          userId: user.id, // Store user ID in metadata for webhook
        },
      });

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        console.error('Stripe Checkout Error:', error);
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Checkout initiation failed:', error);
      alert(`Failed to initiate checkout. Please try again. ${error instanceof Error ? error.message : ''}`);
    }
  };

  const freeFeatures = [
    'Limited character selection (major characters)',
    '5 messages per conversation',
    'Basic denominations only',
    'English language support',
    'No conversation saving',
  ];

  const premiumFeatures = [
    'Full character library (50+ characters)',
    'Unlimited conversation length',
    'All denominations and theological perspectives',
    'Multi-language support',
    'Save and export conversations',
    'Voice input/output',
    'Ad-free experience',
  ];

  return (
    <>
      {/* pt-32 offsets fixed banner (~64 px) + sticky header (~64 px) so content
          starts fully below both elements on all screens */}
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32">
      {/* Heavenly background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light rays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent opacity-30 animate-ray-pulse"></div>
        
        {/* Cloud elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
          Choose Your Path
        </h1>
        <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto">
          Unlock deeper insights and unlimited conversations with our Premium plan.
        </p>

        {/* Billing Period Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full bg-white/20 backdrop-blur-sm p-1 shadow-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-yellow-400 text-blue-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-yellow-400 text-blue-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Yearly (Save 17%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Tier Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20 flex flex-col">
            <h2 className="text-3xl font-bold text-yellow-300 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Free
            </h2>
            <p className="text-white/80 text-lg mb-6">Start your spiritual journey</p>
            <div className="text-white text-5xl font-extrabold mb-6">
              $0<span className="text-xl font-medium">/month</span>
            </div>
            <ul className="text-white/90 text-left space-y-3 flex-grow mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => alert('You are already on the Free plan!')}
              className="w-full bg-white/20 text-white py-3 rounded-lg font-semibold text-lg hover:bg-white/30 transition-all"
            >
              Current Plan
            </button>
          </div>

          {/* Premium Tier Card */}
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-yellow-300 flex flex-col transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold shadow-md">
              Most Popular
            </div>
            <h2 className="text-3xl font-bold text-yellow-300 mb-4 mt-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Premium
            </h2>
            <p className="text-white/80 text-lg mb-6">Unlock the full spiritual experience</p>
            <div className="text-white text-5xl font-extrabold mb-6">
              {displayPrice}<span className="text-xl font-medium">{displayPeriod}</span>
            </div>
            <ul className="text-white/90 text-left space-y-3 flex-grow mb-8">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={handleCheckout}
              className="w-full bg-yellow-500 text-blue-900 py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-all shadow-lg"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>

        <p className="mt-12 text-blue-200 text-sm">
          All plans include access to the core chat engine and basic character interactions.
        </p>
        <p className="mt-2 text-blue-200 text-sm">
          <Link to="/" className="text-yellow-300 hover:underline">
            Return to Chat
          </Link>
        </p>
      </div>
      </div>
    </>
  );
};

export default PricingPage;
