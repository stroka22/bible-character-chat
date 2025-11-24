import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession, StripeConfigurationError } from '../services/stripe';

export default function AdminUpgrade() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [showDebug, setShowDebug] = useState(() => new URLSearchParams(window.location.search).get('debug') === '1');

  // Support either env var name to avoid confusion
  const priceMonthly = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const override = params.get('price') || params.get('price_monthly');
    return (
      override ||
      import.meta.env.VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY ||
      import.meta.env.VITE_STRIPE_PRICE_MONTHLY ||
      ''
    );
  }, []);
  const priceYearly = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const override = params.get('price') || params.get('price_yearly');
    return (
      override ||
      import.meta.env.VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY ||
      import.meta.env.VITE_STRIPE_PRICE_YEARLY ||
      ''
    );
  }, []);
  const legacySinglePrice = useMemo(() => (
    import.meta.env.VITE_STRIPE_PRICE_ADMIN_ORG ||
    import.meta.env.VITE_ADMIN_ORG_PRICE_ID ||
    ''
  ), []);
  const activePriceId = billingCycle === 'yearly'
    ? (priceYearly || legacySinglePrice)
    : (priceMonthly || legacySinglePrice);

  const successUrl = `${window.location.origin}/admin?upgraded=1`;
  const cancelUrl = `${window.location.origin}/admin/upgrade?canceled=1`;

  // Surface environment mode to help ensure publishable key and price IDs
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
  const stripeMode = stripePublicKey.startsWith('pk_live_') ? 'live' : (stripePublicKey ? 'test' : 'disabled');

  const handleUpgrade = async () => {
    setError('');
    if (!activePriceId) {
      setError('Missing Stripe price ID(s). Please configure VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY and VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY.');
      return;
    }
    if (!user) {
      setError('You must be signed in to upgrade.');
      return;
    }
    setLoading(true);
    try {
      await createCheckoutSession({
        priceId: activePriceId,
        successUrl,
        cancelUrl,
        customerEmail: profile?.email,
        metadata: { userId: user.id, plan: 'admin_org', cadence: billingCycle },
      });
      // redirectToCheckout will navigate away; no further code expected here
    } catch (e) {
      const msg = e instanceof StripeConfigurationError ? e.message : (e?.message || 'Checkout failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade your Organization</h1>
      <p className="text-gray-700 mb-6">Enable admin tools for church leaders and influencers: groups, studies, character customization, premium tracking, and weekly CSV reports.</p>

      {!activePriceId && (
        <div className="mb-6 p-3 rounded border border-amber-300 bg-amber-50 text-amber-800">
          Environment not configured: set <code>VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY</code> and <code>VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY</code>.
        </div>
      )}

      <div className="bg-white rounded-md shadow border p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-gray-900 font-semibold">Admin (Per Organization)</div>
            <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>Unlimited member conversations</li>
              <li>Leader tools: Groups, Studies, Featured Character</li>
              <li>Premium member tracking</li>
              <li>Weekly CSV email summary</li>
            </ul>
          </div>
        </div>

        {/* Billing cadence selector */}
        <div className="mt-4 inline-flex rounded-md border border-gray-300 overflow-hidden">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-sm ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Monthly ($97)
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 text-sm border-l border-gray-300 ${billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Yearly ($970)
          </button>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading || !activePriceId}
          className={`mt-5 inline-flex items-center rounded-md px-4 py-2 text-white ${
            loading || !activePriceId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Redirecting…' : `Upgrade – ${billingCycle === 'yearly' ? 'Yearly $970' : 'Monthly $97'}`}
        </button>
        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {/* Debug/Env panel to ensure correct Stripe account & mode */}
        <div className="mt-5 text-xs text-gray-600">
          <button
            type="button"
            className="underline"
            onClick={() => setShowDebug(v => !v)}
          >
            {showDebug ? 'Hide' : 'Show'} environment info
          </button>
          {showDebug && (
            <div className="mt-2 rounded border bg-gray-50 p-3 text-gray-700">
              <div><span className="font-semibold">Stripe mode:</span> {stripeMode}</div>
              <div className="mt-1"><span className="font-semibold">Publishable key:</span> {stripePublicKey ? `${stripePublicKey.slice(0, 10)}…` : 'not set'}</div>
              <div className="mt-1"><span className="font-semibold">Price (monthly):</span> {priceMonthly || '(none)'}
                {priceMonthly && priceMonthly.includes('_test_') && stripeMode === 'live' && (
                  <span className="ml-2 text-red-700">(test price in live mode)</span>
                )}
              </div>
              <div className="mt-1"><span className="font-semibold">Price (yearly):</span> {priceYearly || '(none)'}
                {priceYearly && priceYearly.includes('_test_') && stripeMode === 'live' && (
                  <span className="ml-2 text-red-700">(test price in live mode)</span>
                )}
              </div>
              <div className="mt-2">
                URL overrides supported: <code>?price_monthly=price_...&price_yearly=price_...</code>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Questions? Contact us at <a className="underline" href="mailto:support@faithtalkai.com">support@faithtalkai.com</a>.
      </p>
    </div>
  );
}
