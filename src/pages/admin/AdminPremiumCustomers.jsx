import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

// Lightweight checker that mirrors stripe-safe behavior for listing subscriptions
async function getActiveSubscriptionByCustomerId(customerId) {
  if (!customerId) return null;
  try {
    const response = await supabase.functions.invoke('get-subscription', {
      body: { customerId }
    });
    if (response.error) return null;
    const subs = response.data?.subscriptions || [];
    if (!subs.length) return null;
    // Prefer an actually active/trialing subscription if present
    const sub = subs.find((s) => ['active', 'trialing'].includes(s.status)) || subs[0];
    // Treat cancel_at_period_end as still premium until period ends
    const isActive = ['active', 'trialing'].includes(sub.status);
    return {
      id: sub.id,
      status: sub.status,
      isActive,
      priceId: sub.items?.data?.[0]?.price?.id,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  } catch (e) {
    console.warn('[AdminPremiumCustomers] failed to fetch subscription for', customerId, e);
    return null;
  }
}

export default function AdminPremiumCustomers() {
  const { user } = useAuth();
  const [ownerSlug, setOwnerSlug] = useState('default');
  const [members, setMembers] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // all | stripe | overrides
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Determine current org from localStorage (kept in sync by AuthContext)
    try {
      const ls = localStorage.getItem('ownerSlug');
      if (ls) setOwnerSlug(ls);
    } catch {}
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Fetch profiles for this org
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, display_name, owner_slug, stripe_customer_id, premium_override')
          .eq('owner_slug', ownerSlug)
          .order('display_name', { ascending: true });
        if (error) throw error;

        // For each member with a customer id, fetch active subscription
        const enriched = await Promise.all(
          (data || []).map(async (p) => {
            const sub = p.stripe_customer_id
              ? await getActiveSubscriptionByCustomerId(p.stripe_customer_id)
              : null;
            return { ...p, subscription: sub };
          })
        );
        if (mounted) setMembers(enriched);
      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || 'Failed to load members');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (ownerSlug) load();
    return () => { mounted = false; };
  }, [ownerSlug]);

  const stats = useMemo(() => {
    const total = members.length;
    const premiumStripe = members.filter(m => m.subscription?.isActive).length;
    const premiumOverrides = members.filter(m => !m.subscription?.isActive && m.premium_override).length;
    const premiumCombined = premiumStripe + premiumOverrides;
    return { total, premiumStripe, premiumOverrides, premiumCombined };
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (filterMode === 'stripe') return members.filter(m => m.subscription?.isActive);
    if (filterMode === 'overrides') return members.filter(m => !m.subscription?.isActive && m.premium_override);
    return members;
  }, [members, filterMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-yellow-300">Home</Link>
            <span>&gt;</span>
            <Link to="/admin" className="text-yellow-300">Admin</Link>
            <span>&gt;</span>
            <span>Premium Customers</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-bold">Premium Customers</h1>
            <Link to="/admin" className="px-3 py-2 bg-yellow-400 text-blue-900 rounded">← Back to Admin</Link>
          </div>
          <p className="text-sm text-blue-200 mt-2">Organization: <span className="font-mono">{ownerSlug}</span></p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="text-blue-200 text-sm">Total Members</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="text-blue-200 text-sm">Premium (Stripe)</div>
            <div className="text-3xl font-bold">{stats.premiumStripe}</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="text-blue-200 text-sm">Premium Overrides</div>
            <div className="text-3xl font-bold">{stats.premiumOverrides}</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="text-blue-200 text-sm">Premium (Combined)</div>
            <div className="text-3xl font-bold">{stats.premiumCombined}</div>
          </div>
        </div>

        <div className="bg-blue-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Members</h2>
            <div className="flex items-center gap-2 text-xs">
              <button
                className={`px-3 py-1 rounded-full border ${filterMode==='all'?'bg-blue-600 text-white border-blue-500':'bg-blue-900 text-blue-100 border-blue-700'}`}
                onClick={() => setFilterMode('all')}
              >All</button>
              <button
                className={`px-3 py-1 rounded-full border ${filterMode==='stripe'?'bg-purple-600 text-white border-purple-500':'bg-blue-900 text-blue-100 border-blue-700'}`}
                onClick={() => setFilterMode('stripe')}
                title="Show members with active/trialing Stripe subscriptions"
              >Stripe</button>
              <button
                className={`px-3 py-1 rounded-full border ${filterMode==='overrides'?'bg-pink-600 text-white border-pink-500':'bg-blue-900 text-blue-100 border-blue-700'}`}
                onClick={() => setFilterMode('overrides')}
                title="Show members with premium overrides only"
              >Overrides</button>
            </div>
          </div>
          <div className="text-blue-200 text-xs mb-3">Showing {filteredMembers.length} of {members.length} members</div>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="p-3 rounded bg-red-700">{error}</div>
          ) : members.length === 0 ? (
            <div className="text-blue-200">No members found for this organization.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Premium</th>
                    <th className="px-3 py-2">Override</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Renews</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="border-t border-blue-700">
                      <td className="px-3 py-2">{m.display_name || '—'}</td>
                      <td className="px-3 py-2">{m.email || '—'}</td>
                      <td className="px-3 py-2">{m.subscription?.isActive || m.premium_override ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2">{m.premium_override ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2">{m.subscription?.status || '—'}</td>
                      <td className="px-3 py-2">{m.subscription?.currentPeriodEnd ? new Date(m.subscription.currentPeriodEnd * 1000).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
