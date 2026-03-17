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
  const { user } = useAuth();
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
  const monthlyPrice = '$6.99';
  const yearlyPrice = '$49.99';
  const displayPrice = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice;
  const displayPeriod = billingPeriod === 'monthly' ? '/month' : '/year';
  const yearlySavings = '$33.89';

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

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Choose Your Plan
            </h1>
            <p className="text-amber-700 text-lg max-w-2xl mx-auto">
              Start your spiritual journey with our free plan, or unlock unlimited access with Premium.
            </p>
          </div>

          {errMsg && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-800">{errMsg}</p>
            </div>
          )}

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

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Free Plan */}
            <div className="bg-white/80 rounded-2xl border border-amber-200 p-6">
              <h3 className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Free</h3>
              <div className="text-3xl font-bold text-amber-800 mb-4">$0 <span className="text-base font-normal text-amber-600">/forever</span></div>
              <p className="text-amber-700 mb-6">Perfect for exploring biblical conversations.</p>
              <Link
                to="/chat"
                className="block w-full py-3 text-center bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl border-2 border-amber-400 p-6 relative">
              <div className="absolute -top-3 right-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Premium</h3>
              <div className="text-3xl font-bold text-amber-800 mb-4">{displayPrice} <span className="text-base font-normal text-amber-600">{displayPeriod}</span></div>
              <p className="text-amber-700 mb-6">Unlimited access to all features and characters.</p>
              
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

          <ScrollDivider />

          {/* Premium Benefits Summary */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-amber-900 text-center mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
              Premium Benefits
            </h2>
            <div className="bg-white/80 rounded-xl border border-amber-200 p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">My Walk Dashboard</p>
                    <p className="text-sm text-amber-700">Track your spiritual journey and progress</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">Unlimited Conversations</p>
                    <p className="text-sm text-amber-700">Save and continue all your conversations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">Roundtable Discussions</p>
                    <p className="text-sm text-amber-700">Multi-character group conversations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">All Bible Studies</p>
                    <p className="text-sm text-amber-700">Full access to all guided studies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">All Characters</p>
                    <p className="text-sm text-amber-700">Access to every biblical character</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-900">Priority Support</p>
                    <p className="text-sm text-amber-700">Get help when you need it</p>
                  </div>
                </div>
              </div>
            </div>
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
