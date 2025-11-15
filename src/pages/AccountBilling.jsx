import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AccountBilling = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpen = params.get('open') === '1';
    if (!shouldOpen) return;
    if (!user?.id) return;
    (async () => {
      try {
        setLaunching(true);
        const resp = await fetch('/api/create-billing-portal-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, returnUrl: 'https://faithtalkai.com/account' })
        });
        if (!resp.ok) {
          const text = await resp.text();
          let msg = `HTTP ${resp.status}`;
          try { const j = JSON.parse(text); msg = j?.error || msg; } catch {}
          throw new Error(msg);
        }
        const { url } = await resp.json();
        if (!url) throw new Error('Missing billing portal URL');
        window.location.href = url;
      } catch (e) {
        setError(e?.message || 'Failed to open billing portal');
      } finally {
        setLaunching(false);
      }
    })();
  }, [location.search, user?.id]);

  const handleOpen = async () => {
    if (!user?.id) return;
    try {
      setLaunching(true);
      const resp = await fetch('/api/create-billing-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, returnUrl: 'https://faithtalkai.com/account' })
      });
      if (!resp.ok) {
        const text = await resp.text();
        let msg = `HTTP ${resp.status}`;
        try { const j = JSON.parse(text); msg = j?.error || msg; } catch {}
        throw new Error(msg);
      }
      const { url } = await resp.json();
      if (!url) throw new Error('Missing billing portal URL');
      window.location.href = url;
    } catch (e) {
      setError(e?.message || 'Failed to open billing portal');
    } finally {
      setLaunching(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
          <p>Sign in to manage your subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white p-6">
      <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Manage Subscription</h1>
        <p className="mb-6 text-blue-100">Open the Stripe Billing Portal to cancel, pause, or update your subscription.</p>
        {error && (
          <div className="mb-4 rounded bg-red-100 text-red-700 p-3 text-sm">{error}</div>
        )}
        <button
          onClick={handleOpen}
          disabled={launching}
          className={`w-full ${launching ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400'} text-blue-900 py-3 rounded-lg font-bold text-lg transition-all shadow-lg`}
        >
          {launching ? 'Opening…' : 'Open Billing Portal'}
        </button>
      </div>
    </div>
  );
};

export default AccountBilling;
