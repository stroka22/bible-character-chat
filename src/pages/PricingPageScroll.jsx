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
  
  const [billingPeriod, setBillingPeriod] = useState('yearly');
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

  // Feature comparison data
  const features = [
    { name: 'Chat with Biblical Characters', guest: '5 messages', free: 'Unlimited', premium: 'Unlimited' },
    { name: 'Signup Prompts', guest: 'Every 5 messages', free: 'None', premium: 'None' },
    { name: 'Track Bible Study Progress', guest: false, free: true, premium: true },
    { name: 'Track Reading Plan Progress', guest: false, free: true, premium: true },
    { name: 'Continue Past Conversations', guest: false, free: false, premium: true },
    { name: 'My Walk Dashboard', guest: false, free: false, premium: true },
    { name: 'Roundtable Discussions', guest: false, free: false, premium: true },
    { name: 'Revisit Study Discussions', guest: false, free: false, premium: true },
    { name: 'Revisit Reading Reflections', guest: false, free: false, premium: true },
  ];

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const XIcon = () => (
    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const renderFeatureValue = (value) => {
    if (value === true) return <CheckIcon />;
    if (value === false) return <XIcon />;
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Choose Your Plan
            </h1>
            <p className="text-amber-700 text-lg max-w-2xl mx-auto">
              Start exploring for free, or unlock the full experience with Premium.
            </p>
          </div>

          {errMsg && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-800">{errMsg}</p>
            </div>
          )}

          {/* 3-Tier Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Guest / No Account */}
            <div className="bg-white/60 rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Guest</h3>
              <div className="text-3xl font-bold text-gray-600 mb-1">$0</div>
              <p className="text-sm text-gray-500 mb-4">No account needed</p>
              <p className="text-gray-600 mb-6 text-sm">Try it out with limited access.</p>
              <Link
                to="/chat"
                className="block w-full py-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Start Chatting
              </Link>
            </div>

            {/* Free Account */}
            <div className="bg-white/80 rounded-2xl border border-amber-200 p-6">
              <h3 className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Free Account</h3>
              <div className="text-3xl font-bold text-amber-800 mb-1">$0</div>
              <p className="text-sm text-amber-600 mb-4">Forever free</p>
              <p className="text-amber-700 mb-6 text-sm">Unlimited chats without interruptions.</p>
              {isAuthenticated ? (
                <div className="block w-full py-3 text-center bg-amber-100 text-amber-700 font-medium rounded-lg">
                  Current Plan
                </div>
              ) : (
                <Link
                  to="/signup"
                  className="block w-full py-3 text-center bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-lg transition-colors"
                >
                  Create Free Account
                </Link>
              )}
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl border-2 border-amber-400 p-6 relative">
              <div className="absolute -top-3 right-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Premium</h3>
              <div className="text-3xl font-bold text-amber-800 mb-1">{displayPrice}</div>
              <p className="text-sm text-amber-600 mb-4">{displayPeriod}</p>
              <p className="text-amber-700 mb-6 text-sm">Full access to all features.</p>
              
              {isPremium ? (
                <button
                  onClick={handleManageSubscription}
                  className="block w-full py-3 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
                >
                  Manage Subscription
                </button>
              ) : hasStripeCustomer ? (
                <button
                  onClick={handleManageSubscription}
                  className="block w-full py-3 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
                >
                  Manage Billing
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutInProgress || stripeLoaded === false}
                  className="block w-full py-3 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCheckoutInProgress ? 'Processing...' : 'Subscribe Now'}
                </button>
              )}
            </div>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-amber-100 rounded-full p-1 flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Yearly <span className="text-xs">(Save {yearlySavings})</span>
              </button>
            </div>
          </div>

          <ScrollDivider />

          {/* Feature Comparison Table */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-amber-900 text-center mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
              Compare Plans
            </h2>
            
            {/* Desktop Table */}
            <div className="hidden md:block bg-white/80 rounded-xl border border-amber-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50 border-b border-amber-200">
                    <th className="text-left py-4 px-6 text-amber-900 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 text-gray-600 font-semibold">Guest</th>
                    <th className="text-center py-4 px-4 text-amber-800 font-semibold">Free Account</th>
                    <th className="text-center py-4 px-4 text-amber-900 font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={feature.name} className={index % 2 === 0 ? 'bg-white' : 'bg-amber-50/50'}>
                      <td className="py-4 px-6 text-gray-800">{feature.name}</td>
                      <td className="py-4 px-4 text-center">{renderFeatureValue(feature.guest)}</td>
                      <td className="py-4 px-4 text-center">{renderFeatureValue(feature.free)}</td>
                      <td className="py-4 px-4 text-center">{renderFeatureValue(feature.premium)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {features.map((feature) => (
                <div key={feature.name} className="bg-white/80 rounded-lg border border-amber-200 p-4">
                  <p className="font-medium text-gray-800 mb-3">{feature.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Guest</p>
                      <div className="flex justify-center">{renderFeatureValue(feature.guest)}</div>
                    </div>
                    <div>
                      <p className="text-amber-600 text-xs mb-1">Free</p>
                      <div className="flex justify-center">{renderFeatureValue(feature.free)}</div>
                    </div>
                    <div>
                      <p className="text-amber-800 text-xs mb-1">Premium</p>
                      <div className="flex justify-center">{renderFeatureValue(feature.premium)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-10 text-center bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-8 border border-amber-200">
            <h3 className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              Ready to deepen your faith journey?
            </h3>
            <p className="text-amber-700 mb-6">
              Get unlimited access to all features with Premium.
            </p>
            {!isPremium && (
              <button
                onClick={handleCheckout}
                disabled={isCheckoutInProgress || stripeLoaded === false}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isCheckoutInProgress ? 'Processing...' : `Start Premium - ${displayPrice}${displayPeriod}`}
              </button>
            )}
          </div>

          {/* FAQ */}
          <div className="mt-10 text-center">
            <p className="text-amber-700">
              Have questions?{' '}
              <Link to="/faq" className="text-amber-600 font-medium hover:text-amber-800">Visit our FAQ</Link>
              {' '}or{' '}
              <Link to="/contact" className="text-amber-600 font-medium hover:text-amber-800">Contact Us</Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default PricingPageScroll;
