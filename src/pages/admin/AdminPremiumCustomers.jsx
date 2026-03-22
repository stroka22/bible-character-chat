import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

// Download members as CSV
function downloadCSV(members, filename = 'members.csv') {
  const headers = ['Name', 'Email', 'Premium', 'Source', 'Status', 'Renews'];
  const rows = members.map(m => [
    m.display_name || '',
    m.email || '',
    m.isPremium ? 'Yes' : 'No',
    m.premium_override && m.subscription?.isActive 
      ? 'Override + Stripe' 
      : m.premium_override 
        ? 'Override' 
        : m.subscription?.isActive 
          ? 'Stripe' 
          : '',
    m.subscription?.status || '',
    m.subscription?.currentPeriodEnd ? new Date(m.subscription.currentPeriodEnd * 1000).toLocaleDateString() : ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Lightweight checker that mirrors stripe-safe behavior for listing subscriptions
// Fetch active subscription by customer id, falling back to email if needed
async function getActiveSubscriptionForProfile(profile) {
  try {
    let subs = [];
    if (profile?.stripe_customer_id) {
      const r = await fetch('/api/stripe-get-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: profile.stripe_customer_id })
      });
      if (r.ok) {
        const d = await r.json();
        subs = d?.subscriptions || [];
      }
    }
    if ((!subs || subs.length === 0) && profile?.email) {
      const r2 = await fetch('/api/stripe-get-subscriptions-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email })
      });
      if (r2.ok) {
        const d2 = await r2.json();
        subs = d2?.subscriptions || [];
      }
    }
    if (!subs || subs.length === 0) return null;
    const sub = subs.find((x) => ['active', 'trialing'].includes(x.status)) || subs[0];
    const nowMs = Date.now();
    const periodEndMs = (sub?.current_period_end ? sub.current_period_end * 1000 : 0);
    const isActive = ['active', 'trialing'].includes(sub.status) || (!!sub?.cancel_at_period_end && periodEndMs > nowMs);
    return {
      id: sub.id,
      status: sub.status,
      isActive,
      priceId: sub.items?.data?.[0]?.price?.id,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  } catch (e) {
    console.warn('[AdminPremiumCustomers] failed to fetch subscription for', profile?.email || profile?.stripe_customer_id, e);
    return null;
  }
}

export default function AdminPremiumCustomers() {
  const { user, profile } = useAuth();
  const [ownerSlug, setOwnerSlug] = useState('default');
  const [filterOrg, setFilterOrg] = useState('all'); // 'all' for superadmin to see everyone
  const [members, setMembers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isSuperadmin = profile?.role === 'superadmin';

  useEffect(() => {
    // Determine current org from localStorage (kept in sync by AuthContext)
    try {
      const ls = localStorage.getItem('ownerSlug');
      if (ls) setOwnerSlug(ls);
    } catch {}
  }, [user]);

  // Load available organizations for superadmin filter
  useEffect(() => {
    if (!isSuperadmin) return;
    async function loadOrgs() {
      try {
        const { data } = await supabase
          .from('owners')
          .select('owner_slug, display_name')
          .order('display_name');
        setOrgs(data || []);
      } catch {}
    }
    loadOrgs();
  }, [isSuperadmin]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Build query - superadmin with 'all' filter sees everyone
        let query = supabase
          .from('profiles')
          .select('id, email, display_name, owner_slug, stripe_customer_id, premium_override, role')
          .order('email', { ascending: true });
        
        // Apply org filter
        if (isSuperadmin && filterOrg === 'all') {
          // No filter - get all users
        } else if (isSuperadmin && filterOrg) {
          query = query.eq('owner_slug', filterOrg);
        } else {
          // Non-superadmin only sees their org
          query = query.eq('owner_slug', ownerSlug);
        }
        
        const { data, error } = await query;
        if (error) throw error;

        // For each member, fetch active subscription (by customer id or email fallback)
        const enriched = await Promise.all(
          (data || []).map(async (p) => {
            const sub = await getActiveSubscriptionForProfile(p);
            // Consider premium if has active subscription OR has premium_override
            const isPremium = p.premium_override || sub?.isActive;
            return { ...p, subscription: sub, isPremium };
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
    load();
    return () => { mounted = false; };
  }, [ownerSlug, filterOrg, isSuperadmin]);

  const stats = useMemo(() => {
    const total = members.length;
    const premium = members.filter(m => m.isPremium).length;
    return { total, premium };
  }, [members]);

  // Toggle premium override for a member
  const handleTogglePremium = useCallback(async (memberId, currentOverride) => {
    const newOverride = !currentOverride;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ premium_override: newOverride })
        .eq('id', memberId);
      
      if (error) throw error;
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === memberId 
          ? { ...m, premium_override: newOverride, isPremium: newOverride || m.subscription?.isActive }
          : m
      ));
    } catch (e) {
      console.error('Failed to toggle premium:', e);
      alert('Failed to update premium status');
    }
  }, []);

  const handleDownloadCSV = useCallback(() => {
    const orgName = filterOrg === 'all' ? 'all-orgs' : filterOrg || ownerSlug;
    downloadCSV(members, `members-${orgName}-${new Date().toISOString().split('T')[0]}.csv`);
  }, [members, filterOrg, ownerSlug]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-yellow-300">Home</Link>
            <span>&gt;</span>
            <Link to="/admin" className="text-yellow-300">Admin</Link>
            <span>&gt;</span>
            <span>Member Status</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-bold">Member Status</h1>
            <Link to="/admin" className="px-3 py-2 bg-yellow-400 text-blue-900 rounded">← Back to Admin</Link>
          </div>
          {isSuperadmin ? (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-blue-200">Filter by Organization:</span>
              <select
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
                className="px-3 py-1 rounded bg-blue-800 text-white border border-blue-600 text-sm"
              >
                <option value="all">All Organizations</option>
                {orgs.map(o => (
                  <option key={o.owner_slug} value={o.owner_slug}>
                    {o.display_name || o.owner_slug}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-blue-200 mt-2">Organization: <span className="font-mono">{ownerSlug}</span></p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="text-blue-200 text-sm">Total Members</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="text-blue-200 text-sm">Active Premium</div>
            <div className="text-3xl font-bold">{stats.premium}</div>
          </div>
        </div>

        <div className="bg-blue-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Members</h2>
            <button
              onClick={handleDownloadCSV}
              disabled={members.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
          </div>
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
                    {isSuperadmin && <th className="px-3 py-2">Org</th>}
                    {isSuperadmin && <th className="px-3 py-2">Role</th>}
                    <th className="px-3 py-2">Premium</th>
                    <th className="px-3 py-2">Override</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Renews</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id} className="border-t border-blue-700">
                      <td className="px-3 py-2">{m.display_name || '—'}</td>
                      <td className="px-3 py-2">{m.email || '—'}</td>
                      {isSuperadmin && <td className="px-3 py-2 text-xs">{m.owner_slug || '—'}</td>}
                      {isSuperadmin && <td className="px-3 py-2 text-xs">{m.role || 'user'}</td>}
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${m.isPremium ? 'bg-green-600' : 'bg-gray-600'}`}>
                          {m.isPremium ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleTogglePremium(m.id, m.premium_override)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${m.premium_override ? 'bg-green-500' : 'bg-gray-500'}`}
                          title={m.premium_override ? 'Click to remove premium override' : 'Click to grant premium override'}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${m.premium_override ? 'left-7' : 'left-1'}`} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {m.premium_override && m.subscription?.isActive 
                          ? 'Override + Stripe' 
                          : m.premium_override 
                            ? 'Override' 
                            : m.subscription?.isActive 
                              ? 'Stripe' 
                              : '—'}
                      </td>
                      <td className="px-3 py-2 text-xs">{m.subscription?.status || '—'}</td>
                      <td className="px-3 py-2 text-xs">{m.subscription?.currentPeriodEnd ? new Date(m.subscription.currentPeriodEnd * 1000).toLocaleDateString() : '—'}</td>
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
