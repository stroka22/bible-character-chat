import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from '../hooks/usePremium';
import { getPublicKey, createCheckoutSession, SUBSCRIPTION_PRICES } from '../services/stripe';
import { openBillingPortal } from '../services/stripe-safe';
import { supabase } from '../services/supabase';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const stripePromise = loadStripe(getPublicKey());

const PricingPageScroll = () => {
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = usePremium();
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutTriggered = useRef(false);
  
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false);
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(null);

  const selectedPriceId = billingPeriod === 'monthly' ? SUBSCRIPTION_PRICES.MONTHLY : SUBSCRIPTION_PRICES.YEARLY;
  const monthlyPrice = '$5.99';
  const yearlyPrice = '$59.99';
  const displayPrice = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice;
  const displayPeriod = billingPeriod === 'monthly' ? '/month' : '/year';
  const yearlySavings = '$11.89'; // 5.99 * 12 = 71.88, save 11.89

  useEffect(() => {
    (async () => {
      try {
        const stripe = await stripePromise;
        setStripeLoaded(!!stripe);
      } catch (e) {
        setStripeLoaded(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setHasStripeCustomer(false);
        return;
      }
      try {
        const { data } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();
        setHasStripeCustomer(!!data?.stripe_customer_id);
      } catch {
        setHasStripeCustomer(false);
      }
    })();
  }, [user?.id]);

  const handleCheckout = async () => {
    if (isCheckoutInProgress) return;
    try {
      setIsCheckoutInProgress(true);
      setErrMsg(null);
      const stripe = await stripePromise;
      if (!stripe) {
        setErrMsg('Payment system unavailable. Please try again later.');
        return;
      }
      if (!user) {
        navigate('/login/preview?redirect=pricing/preview&checkout=true&period=' + billingPeriod);
        return;
      }
      const session = await createCheckoutSession({
        priceId: selectedPriceId,
        successUrl: window.location.origin + '/my-walk/preview?checkout=success',
        cancelUrl: window.location.origin + '/pricing/preview?checkout=canceled',
        customerId: user.id,
        customerEmail: user.email,
        metadata: { userId: user.id },
      });
      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
      if (error) setErrMsg(`Stripe redirect error: ${error.message}`);
    } catch (error) {
      setErrMsg(`Failed to initiate checkout. ${error?.message || 'Unknown error'}`);
    } finally {
      setIsCheckoutInProgress(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.id) return;
    try {
      await openBillingPortal({ userId: user.id, returnUrl: window.location.origin + '/pricing/preview' });
    } catch (e) {
      setErrMsg(e?.message || 'Failed to open billing portal');
    }
  };

  // Feature comparison data - Free vs Premium only
  const features = [
    { name: 'Chat with Biblical Characters', free: 'Unlimited', premium: 'Unlimited' },
    { name: 'My Walk Dashboard', free: false, premium: true },
    { name: 'Access Your Complete Conversation History', free: false, premium: true },
    { name: 'Roundtable Discussions', free: false, premium: true },
    { name: 'Invite Friends into Conversations', free: false, premium: true },
  ];

  const CheckIcon = ({ className = "w-6 h-6" }) => (
    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
      <svg className={`${className} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );

  const XIcon = ({ className = "w-6 h-6" }) => (
    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className={`${className} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );

  const renderFeatureValue = (value) => {
    if (value === true) return <CheckIcon />;
    if (value === false) return <XIcon />;
    return <span className="text-sm font-medium text-amber-800 bg-amber-100 px-3 py-1 rounded-full">{value}</span>;
  };

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Choose Your Plan
            </h1>
            <p className="text-amber-700 text-lg max-w-2xl mx-auto">
              Start with a free account, or unlock the full experience with Premium.
            </p>
          </div>

          {errMsg && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-800">{errMsg}</p>
            </div>
          )}

          {/* Billing Period Toggle - Above cards */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 rounded-full p-1.5 flex shadow-sm border border-amber-200">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'yearly' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Yearly <span className="text-xs opacity-90">(Save {yearlySavings})</span>
              </button>
            </div>
          </div>

          {/* 2-Column Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Free Account */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-800">$0</span>
                </div>
                <p className="text-gray-600 mt-3">Unlimited conversations with Biblical characters.</p>
              </div>
              
              <div className="flex-1">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Unlimited chats</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">No interruptions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-400">Conversation history</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-400">Roundtable discussions</span>
                  </li>
                </ul>
              </div>

              {isAuthenticated && !isPremium ? (
                <div className="w-full py-3 text-center bg-gray-100 text-gray-600 font-medium rounded-xl">
                  Current Plan
                </div>
              ) : !isAuthenticated ? (
                <Link
                  to="/signup"
                  className="block w-full py-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors"
                >
                  Create Free Account
                </Link>
              ) : null}
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border-2 border-amber-400 p-8 relative flex flex-col shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                RECOMMENDED
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-amber-900">{displayPrice}</span>
                  <span className="text-amber-700">{displayPeriod}</span>
                </div>
                <p className="text-amber-800 mt-3">Full access to everything FaithTalkAI offers.</p>
              </div>
              
              <div className="flex-1">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-amber-900">Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-amber-900">My Walk dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-amber-900">Access complete conversation history</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-amber-900">Roundtable discussions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-amber-900">Invite friends into conversations</span>
                  </li>
                </ul>
              </div>
              
              {isPremium ? (
                <button
                  onClick={handleManageSubscription}
                  className="w-full py-3 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  Manage Subscription
                </button>
              ) : hasStripeCustomer ? (
                <button
                  onClick={handleManageSubscription}
                  className="w-full py-3 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  Manage Billing
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutInProgress || stripeLoaded === false}
                  className="w-full py-3 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
                >
                  {isCheckoutInProgress ? 'Processing...' : 'Get Premium'}
                </button>
              )}
            </div>
          </div>

          <ScrollDivider />

          {/* Feature Comparison Table */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-amber-900 text-center mb-8" style={{ fontFamily: 'Cinzel, serif' }}>
              Compare Plans
            </h2>
            
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-100">
                    <th className="text-left py-5 px-8 text-gray-900 font-semibold text-lg">Feature</th>
                    <th className="text-center py-5 px-6 w-32">
                      <span className="text-gray-700 font-semibold">Free</span>
                    </th>
                    <th className="text-center py-5 px-6 w-32 bg-amber-50">
                      <span className="text-amber-800 font-semibold">Premium</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={feature.name} className={`border-b border-amber-50 ${index === features.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="py-5 px-8 text-gray-800">{feature.name}</td>
                      <td className="py-5 px-6 text-center">
                        <div className="flex justify-center">{renderFeatureValue(feature.free)}</div>
                      </td>
                      <td className="py-5 px-6 text-center bg-amber-50/50">
                        <div className="flex justify-center">{renderFeatureValue(feature.premium)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {features.map((feature) => (
                <div key={feature.name} className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm">
                  <p className="font-medium text-gray-800 mb-4">{feature.name}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Free</p>
                      <div className="flex justify-center">{renderFeatureValue(feature.free)}</div>
                    </div>
                    <div className="text-center bg-amber-50 rounded-lg py-2">
                      <p className="text-amber-700 text-xs font-medium uppercase tracking-wide mb-2">Premium</p>
                      <div className="flex justify-center">{renderFeatureValue(feature.premium)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 text-center">
            <p className="text-amber-700">
              Have questions?{' '}
              <Link to="/faq" className="text-amber-600 font-medium hover:text-amber-800 underline">Visit our FAQ</Link>
              {' '}or{' '}
              <Link to="/contact" className="text-amber-600 font-medium hover:text-amber-800 underline">Contact Us</Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default PricingPageScroll;
