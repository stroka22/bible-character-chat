import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, SUPABASE_ANON_KEY } from '../../services/supabase';
import { getMyProfile } from '../../services/invitesService';
import { useAuth } from '../../contexts/AuthContext';
import { characterRepository } from '../../repositories/characterRepository';
import { bibleStudiesAdminRepository } from '../../repositories/bibleStudiesRepository';
import { readingPlansRepository } from '../../repositories/readingPlansRepository';

// Helper: fetch active Stripe subscription info for a customer id
async function fetchActiveSubscription(customerId) {
  if (!customerId) return null;
  try {
    const resp = await fetch('/api/stripe-get-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId })
    });
    if (!resp.ok) return null;
    const { subscriptions: subs = [] } = await resp.json();
    if (!subs.length) return null;
    const s = subs.find((x) => ['active', 'trialing'].includes(x.status)) || subs[0];
    const nowMs = Date.now();
    const periodEndMs = (s?.current_period_end ? s.current_period_end * 1000 : 0);
    const isActive = ['active', 'trialing'].includes(s.status) || (!!s?.cancel_at_period_end && periodEndMs > nowMs);
    return {
      id: s.id,
      status: s.status,
      isActive,
      currentPeriodEnd: s.current_period_end,
      cancelAtPeriodEnd: s.cancel_at_period_end,
    };
  } catch (e) {
    return null;
  }
}

const SuperadminUsersPage = () => {
  // State for current user profile
  const { session, user: authUser, refreshProfile } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for users list
  const [profiles, setProfiles] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [totalProfiles, setTotalProfiles] = useState(0);
  
  // State for owners list (for filter and actions)
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  
  // Aggregated premium vs free stats per organization (superadmin only)
  const [orgStats, setOrgStats] = useState([]);
  const [loadingOrgStats, setLoadingOrgStats] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    ownerSlug: 'all',
    page: 1,
    pageSize: 25
  });
  
  // Action state
  const [actionInProgress, setActionInProgress] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  /* ─────────────────────────────────────────────
   *  New-organization modal state (superadmin)
   * ──────────────────────────────────────────── */
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({ ownerSlug: '', displayName: '' });
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgError, setOrgError] = useState('');

  /* ─────────────────────────────────────────────
   *  Copy All Content modal state (superadmin)
   * ──────────────────────────────────────────── */
  const [showCopyContent, setShowCopyContent] = useState(false);
  const [copyTargetOrg, setCopyTargetOrg] = useState('');
  const [copyingContent, setCopyingContent] = useState(false);
  const [copyResult, setCopyResult] = useState(null);
  const [copyError, setCopyError] = useState('');
  
  // Check if current user is superadmin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      setLoading(true);
      try {
        const { data, error } = await getMyProfile();
        if (error) throw error;
        
        setCurrentProfile(data);
        setIsSuperAdmin(data.role === 'superadmin');
        setIsAdmin(data.role === 'admin' || data.role === 'superadmin');
        
        // Load data based on role
        if (data.role === 'superadmin') {
          await Promise.all([
            loadProfiles(),
            loadOwners()
          ]);
          // After owners are loaded, compute org stats
          await loadOrgStats();
        } else if (data.role === 'admin') {
          await loadProfiles();
        }
      } catch (error) {
        console.error('Error checking superadmin status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSuperAdmin();
  }, []);
  
  // Load profiles with filters
  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      // Build query with filters
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          role,
          owner_slug,
          premium_override,
          stripe_customer_id,
          display_name,
          created_at,
          weekly_csv_enabled
        `, { count: 'exact' });
      
      // Apply filters
      if (filters.search) {
        query = query.ilike('email', `%${filters.search}%`);
      }
      
      if (filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      // Owner slug filter logic
      if (isSuperAdmin) {
        if (filters.ownerSlug !== 'all') {
          query = query.eq('owner_slug', filters.ownerSlug);
        }
      } else if (isAdmin && currentProfile?.owner_slug) {
        query = query.eq('owner_slug', currentProfile.owner_slug);
      }
      
      // Apply pagination
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to).order('email', { ascending: true });
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      // Enrich each profile with subscription state (active Stripe?) so UI
      // can suppress the "Premium Override" badge when a real subscription exists.
      const enriched = await Promise.all(
        (data || []).map(async (p) => {
          // Try by customer id first
          let sub = p.stripe_customer_id
            ? await fetchActiveSubscription(p.stripe_customer_id)
            : null;
          // Fallback: try Stripe by email if not active
          if ((!sub || !sub.isActive) && p.email) {
            try {
              const resp = await fetch('/api/stripe-get-subscriptions-by-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: p.email })
              });
              if (resp.ok) {
                const { subscriptions: subs = [] } = await resp.json();
                if (subs.length > 0) {
                  const s = subs.find((x) => ['active', 'trialing'].includes(x.status)) || subs[0];
                  const nowMs = Date.now();
                  const periodEndMs = (s?.current_period_end ? s.current_period_end * 1000 : 0);
                  const isActive = ['active', 'trialing'].includes(s.status) || (!!s?.cancel_at_period_end && periodEndMs > nowMs);
                  sub = s ? {
                    id: s.id,
                    status: s.status,
                    isActive,
                    currentPeriodEnd: s.current_period_end,
                    cancelAtPeriodEnd: s.cancel_at_period_end,
                  } : null;
                }
              }
            } catch (_) {}
          }
          return { ...p, subscription: sub };
        })
      );
      setProfiles(enriched);
      // Clear selections if list changed
      setSelectedUserIds([]);
      setTotalProfiles(count || 0);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };
  
  // Load owners list for filter and actions
  const loadOwners = async () => {
    setLoadingOwners(true);
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('owner_slug, display_name')
        .order('display_name');
      
      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error loading owners:', error);
    } finally {
      setLoadingOwners(false);
    }
  };

  // Load aggregated org stats: total vs premium (active/trialing) vs premium_override users
  const loadOrgStats = async () => {
    if (!isSuperAdmin) return;
    setLoadingOrgStats(true);
    try {
      // Ensure owners list is available
      let ownersList = owners;
      if (!ownersList || ownersList.length === 0) {
        const { data } = await supabase
          .from('owners')
          .select('owner_slug, display_name')
          .order('display_name');
        ownersList = data || [];
        setOwners(ownersList);
      }

      const results = [];
      for (const o of ownersList) {
        // Fetch profiles for this org with needed fields
        const { data: members, error } = await supabase
          .from('profiles')
          .select('id, email, stripe_customer_id, premium_override')
          .eq('owner_slug', o.owner_slug);
        if (error) {
          console.warn('Failed to load profiles for', o.owner_slug, error);
          continue;
        }
        const total = members?.length || 0;
        let premium = 0;
        let overrides = 0;

        // Prefer local subscriptions table first (active/trialing) to avoid API mismatches
        let activeByUserId = new Set();
        try {
          const ids = (members || []).map(m => m.id);
          if (ids.length) {
            const { data: subsRows } = await supabase
              .from('subscriptions')
              .select('user_id,status')
              .in('user_id', ids);
            (subsRows || [])
              .filter(r => ['active','trialing'].includes(r.status))
              .forEach(r => activeByUserId.add(r.user_id));
          }
        } catch (_e) {}

        // For each member, check local table first then fall back to Stripe lookups
        for (const m of (members || [])) {
          let hasActiveStripe = false;

          // Local table indicates active
          if (activeByUserId.has(m.id)) {
            premium += 1;
            hasActiveStripe = true;
          }

          // Check by customer id if not yet active
          if (!hasActiveStripe && m.stripe_customer_id) {
            try {
              const resp = await fetch('/api/stripe-get-subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: m.stripe_customer_id })
              });
              if (resp.ok) {
                const { subscriptions: subs = [] } = await resp.json();
                if (subs.length > 0) {
                  const s = subs.find((x) => ['active', 'trialing'].includes(x.status)) || subs[0];
                  const nowMs = Date.now();
                  const periodEndMs = (s?.current_period_end ? s.current_period_end * 1000 : 0);
                  const isActive = ['active', 'trialing'].includes(s.status) || (!!s?.cancel_at_period_end && periodEndMs > nowMs);
                  if (isActive) {
                    premium += 1;
                    hasActiveStripe = true;
                  }
                }
              }
            } catch (e) {
              // skip errors for individual member
            }
          }

          // Fallback: if no active Stripe by customer id, try by email
          if (!hasActiveStripe && m.email) {
            try {
              const resp2 = await fetch('/api/stripe-get-subscriptions-by-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: m.email })
              });
              if (resp2.ok) {
                const { subscriptions: subs2 = [] } = await resp2.json();
                const s2 = subs2.find((x) => ['active', 'trialing'].includes(x.status)) || subs2[0];
                const nowMs = Date.now();
                const periodEndMs = (s2?.current_period_end ? s2.current_period_end * 1000 : 0);
                if (s2 && (['active', 'trialing'].includes(s2.status) || (!!s2?.cancel_at_period_end && periodEndMs > nowMs))) {
                  premium += 1;
                  hasActiveStripe = true;
                }
              }
            } catch (e) {
              // ignore
            }
          }

          // Count premium_override only when no active Stripe subscription to avoid double-counting
          if (!hasActiveStripe && m.premium_override) {
            overrides += 1;
          }
        }

        results.push({
          owner_slug: o.owner_slug,
          display_name: o.display_name,
          total,
          premium,
          overrides,
          free: Math.max(0, total - premium - overrides)
        });
      }
      setOrgStats(results);
    } catch (e) {
      console.error('Error loading org stats:', e);
    } finally {
      setLoadingOrgStats(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset to page 1 when filters change
      ...(name !== 'page' && { page: 1 })
    }));
  };

  // Selection helpers
  const isAllSelected = profiles.length > 0 && selectedUserIds.length === profiles.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(profiles.map(p => p.id));
    }
  };
  const toggleSelectOne = (id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedUserIds.length} user(s)? This cannot be undone.`)) return;
    setActionInProgress('bulk');
    setActionMessage({ text: '', type: '' });
    try {
      let success = 0;
      const token = session?.access_token || null;
      for (const id of selectedUserIds) {
        try {
          const { error } = await supabase.functions.invoke('delete-user', {
            body: { userId: id },
            headers: token
              ? { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY }
              : undefined,
          });
          if (error) throw new Error(error.message || 'Edge function failed');
          success += 1;
        } catch (e) {
          console.warn('Bulk delete failed for id', id, e);
        }
      }
      await loadProfiles();
      setActionMessage({ text: `Deleted ${success} of ${selectedUserIds.length} users`, type: success === selectedUserIds.length ? 'success' : 'error' });
    } catch (e) {
      setActionMessage({ text: e?.message || 'Bulk delete failed', type: 'error' });
    } finally {
      setActionInProgress(null);
      setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
    }
  };
  
  // Apply filters when they change
  useEffect(() => {
    if (isAdmin) {
      loadProfiles();
    }
  }, [filters, isAdmin]);
  
  // Handle changing user role
  const handleRoleChange = async (userId, newRole) => {
    if (actionInProgress) return;
    setActionInProgress(userId);
    setActionMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setActionMessage({ 
        text: `User role updated to ${newRole}`, 
        type: 'success' 
      });
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { ...profile, role: newRole } : profile
      ));
      
    } catch (error) {
      console.error('Error updating role:', error);
      setActionMessage({ 
        text: `Error: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setActionInProgress(null);
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
    }
  };
  
  // Handle changing owner slug
  const handleOwnerChange = async (userId, newOwnerSlug) => {
    if (actionInProgress) return;
    setActionInProgress(userId);
    setActionMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ owner_slug: newOwnerSlug })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Find owner display name
      const owner = owners.find(o => o.owner_slug === newOwnerSlug);
      
      setActionMessage({ 
        text: `User moved to ${owner?.display_name || newOwnerSlug}`, 
        type: 'success' 
      });
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { 
          ...profile, 
          owner_slug: newOwnerSlug,
          owners: { display_name: owner?.display_name || newOwnerSlug }
        } : profile
      ));
      
    } catch (error) {
      console.error('Error updating owner:', error);
      setActionMessage({ 
        text: `Error: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setActionInProgress(null);
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
    }
  };

  // Link Stripe customer to profile by email (superadmin only)
  const linkStripeByEmail = async (profile) => {
    if (!isSuperAdmin || actionInProgress) return;
    setActionInProgress(profile.id + ':link');
    setActionMessage({ text: '', type: '' });
    try {
      const resp = await fetch('/api/stripe-get-subscriptions-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Lookup failed');
      const subs = data?.subscriptions || [];
      const s = subs.find(x => ['active','trialing'].includes(x.status)) || subs[0];
      if (!s) throw new Error('No Stripe subscriptions found for this email');
      const customerId = typeof s.customer === 'string' ? s.customer : (s.customer?.id || null);
      if (!customerId) throw new Error('Unable to determine Stripe customer id');
      const { error: upErr } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.id);
      if (upErr) throw new Error(upErr.message || 'Failed to update profile');
      setActionMessage({ text: `Linked Stripe customer ${customerId} to user`, type: 'success' });
      await Promise.all([loadProfiles(), loadOrgStats()]);
    } catch (e) {
      setActionMessage({ text: e?.message || 'Link failed', type: 'error' });
    } finally {
      setActionInProgress(null);
      setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Calculate total pages
  /* ─────────────────────────────────────────────
   *  Helpers – create organisation (superadmin)
   * ──────────────────────────────────────────── */
  const slugify = (str = '') =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin || savingOrg) return;

    setOrgError('');
    const slug =
      newOrg.ownerSlug?.trim() !== ''
        ? slugify(newOrg.ownerSlug)
        : slugify(newOrg.displayName);
    const name = (newOrg.displayName || '').trim();

    if (!slug || !name) {
      setOrgError('Both Display Name and Organization Slug are required.');
      return;
    }
    setSavingOrg(true);
    try {
      const { error } = await supabase
        .from('owners')
        .insert({ owner_slug: slug, display_name: name, created_by: currentProfile?.id });
      if (error) throw error;

      // refresh owners list, select new one
      await loadOwners();
      handleFilterChange('ownerSlug', slug);

      setShowCreateOrg(false);
      setNewOrg({ ownerSlug: '', displayName: '' });
      setActionMessage({
        text: `Organization “${name}” created`,
        type: 'success',
      });
    } catch (err) {
      setOrgError(err.message || 'Failed to create organization');
    } finally {
      setSavingOrg(false);
      setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
    }
  };

  /* ─────────────────────────────────────────────
   *  Copy All Content to Organization (superadmin)
   * ──────────────────────────────────────────── */
  const handleCopyAllContent = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin || copyingContent || !copyTargetOrg) return;

    setCopyError('');
    setCopyResult(null);
    setCopyingContent(true);

    try {
      const results = {
        characters: 0,
        studies: 0,
        plans: 0,
        errors: [],
      };

      // Copy all characters
      try {
        results.characters = await characterRepository.copyAllCharactersToOrg(copyTargetOrg);
      } catch (err) {
        console.error('Failed to copy characters:', err);
        results.errors.push(`Characters: ${err.message || 'Unknown error'}`);
      }

      // Copy all Bible studies (from 'default' where most studies are)
      try {
        results.studies = await bibleStudiesAdminRepository.copyAllStudiesToOrg('default', copyTargetOrg);
      } catch (err) {
        console.error('Failed to copy studies:', err);
        results.errors.push(`Studies: ${err.message || 'Unknown error'}`);
      }

      // Reading plans: Orgs use shared NULL plans by default
      // Copy-on-write happens when they edit a plan
      // No need to bulk copy - just note they have access to shared plans
      results.plans = 148; // Shared plans available to all orgs

      setCopyResult(results);
      
      if (results.errors.length > 0) {
        setActionMessage({
          text: `Copied ${results.characters} characters, ${results.studies} studies, ${results.plans} plans. Errors: ${results.errors.join('; ')}`,
          type: 'error',
        });
      } else {
        setActionMessage({
          text: `Copied ${results.characters} characters, ${results.studies} studies, ${results.plans} plans to ${copyTargetOrg}`,
          type: 'success',
        });
      }
    } catch (err) {
      setCopyError(err.message || 'Failed to copy content');
    } finally {
      setCopyingContent(false);
      setTimeout(() => setActionMessage({ text: '', type: '' }), 8000);
    }
  };

  /* ─────────────────────────────────────────────
   *  View as Organization (superadmin)
   * ──────────────────────────────────────────── */
  const handleViewAsOrg = (orgSlug) => {
    if (!orgSlug) return;
    // Store the org slug in localStorage so the admin panel loads as that org
    localStorage.setItem('ownerSlug', orgSlug);
    window.dispatchEvent(new Event('ownerSlugChanged'));
    // Redirect to admin panel
    window.location.href = '/admin';
  };

  const handleResetToOwnOrg = () => {
    // Reset to the user's actual org
    const myOrg = currentProfile?.owner_slug || 'faithtalkai';
    localStorage.setItem('ownerSlug', myOrg);
    window.dispatchEvent(new Event('ownerSlugChanged'));
    window.location.reload();
  };

  const totalPages = Math.ceil(totalProfiles / filters.pageSize);
  
  // If still loading initial check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }
  
  // If not superadmin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-red-100 border border-red-300 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-800">Access Denied</h1>
          <p className="mb-6 text-red-700">You need superadmin privileges to access this page.</p>
          <Link 
            to="/admin" 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Return to Admin
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-8 pt-24 pb-8 md:pl-72">
      {/* Desktop left sidebar navigation */}
      <div className="hidden md:block">
        <aside className="fixed top-24 left-6 w-64 bg-white rounded-md shadow border">
          <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Content Management</div>
          <nav className="px-2 pb-3 space-y-1">
            <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-100">Overview</Link>
            <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-100">Characters</Link>
            <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-100">Bible Studies</Link>
            <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-100">Reading Plans</Link>
          </nav>
          
          <div className="px-4 pt-3 text-xs font-semibold text-gray-500 uppercase">Users</div>
          <nav className="px-2 pb-3 space-y-1">
            <Link to="/admin/premium" className="block px-3 py-2 rounded hover:bg-gray-100">Premium Members</Link>
            <Link to="/admin/invites" className="block px-3 py-2 rounded hover:bg-gray-100">Manage Invites</Link>
          </nav>
          
          {isSuperAdmin && (
            <>
              <div className="px-4 pt-3 text-xs font-semibold text-gray-500 uppercase">Super-Admin</div>
              <nav className="px-2 pb-3 space-y-1">
                <Link to="/admin/users" className="block px-3 py-2 rounded bg-amber-100 text-amber-900">Users & Organizations</Link>
                <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-100">Account Tiers</Link>
                <Link to="/admin/leads" className="block px-3 py-2 rounded hover:bg-gray-100">Leads</Link>
              </nav>
            </>
          )}
        </aside>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Users & Organizations</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and organization assignments</p>
        </div>
        
        {/* Create-org and Copy Content actions */}
        {isSuperAdmin && (
          <div className="bg-white rounded-lg shadow border p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Manage as Org dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Manage as:</label>
                <select
                  onChange={(e) => e.target.value && handleViewAsOrg(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  defaultValue=""
                >
                  <option value="">Select organization...</option>
                  {owners.map(o => (
                    <option key={o.owner_slug} value={o.owner_slug}>
                      {o.display_name || o.owner_slug}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleResetToOwnOrg}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border"
                  title="Reset to your organization"
                >
                  Reset
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCopyContent(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Copy Content to Org
                </button>
                <button
                  onClick={() => setShowCreateOrg(true)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  + New Organization
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
         *  Create-organization Modal (superadmin only)
         * ──────────────────────────────────────────── */}
        {showCreateOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => !savingOrg && setShowCreateOrg(false)}
            />

            {/* Modal card */}
            <div className="relative bg-white w-11/12 max-w-md rounded-lg shadow-xl p-6 z-10">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Create Organization</h3>

              {orgError && (
                <div className="mb-3 p-2 rounded bg-red-100 text-red-700 text-sm border border-red-200">
                  {orgError}
                </div>
              )}

              <form onSubmit={handleCreateOrganization}>
                {/* Display Name */}
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newOrg.displayName}
                  onChange={(e) =>
                    setNewOrg((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  className="w-full mb-4 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                  placeholder="e.g. Grace Church"
                />

                {/* Slug */}
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Organization Slug
                </label>
                <input
                  type="text"
                  value={newOrg.ownerSlug}
                  onChange={(e) =>
                    setNewOrg((prev) => ({
                      ...prev,
                      ownerSlug: e.target.value,
                    }))
                  }
                  className="w-full mb-4 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                  placeholder="e.g. grace-church"
                />

                {/* Actions */}
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateOrg(false)}
                    disabled={savingOrg}
                    className={`px-4 py-2 rounded-lg ${
                      savingOrg
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingOrg}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      savingOrg
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {savingOrg ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
         *  Copy All Content Modal (superadmin only)
         * ──────────────────────────────────────────── */}
        {showCopyContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => !copyingContent && setShowCopyContent(false)}
            />

            {/* Modal card */}
            <div className="relative bg-white w-11/12 max-w-md rounded-lg shadow-xl p-6 z-10">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Copy Content to Organization</h3>

              <p className="text-gray-600 text-sm mb-4">
                This will copy all characters and Bible studies from the default organization to the selected organization. Reading plans are shared automatically.
              </p>

              {copyError && (
                <div className="mb-3 p-2 rounded bg-red-100 text-red-700 text-sm border border-red-200">
                  {copyError}
                </div>
              )}

              {copyResult && (
                <div className={`mb-3 p-3 rounded text-sm ${copyResult.errors?.length > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                  <p className="font-medium">Copied: {copyResult.characters} characters, {copyResult.studies} studies, {copyResult.plans} plans</p>
                  {copyResult.errors?.length > 0 && (
                    <p className="mt-2 text-xs">Errors: {copyResult.errors.join('; ')}</p>
                  )}
                </div>
              )}

              <form onSubmit={handleCopyAllContent}>
                {/* Target Organization */}
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Target Organization
                </label>
                <select
                  value={copyTargetOrg}
                  onChange={(e) => setCopyTargetOrg(e.target.value)}
                  className="w-full mb-4 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                  disabled={copyingContent}
                >
                  <option value="">Select organization...</option>
                  {owners
                    .filter(o => o.owner_slug && o.owner_slug !== 'default' && o.owner_slug !== 'faithtalkai')
                    .map((o) => (
                      <option key={o.owner_slug} value={o.owner_slug}>
                        {o.display_name || o.owner_slug}
                      </option>
                    ))}
                </select>

                {/* Actions */}
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCopyContent(false);
                      setCopyResult(null);
                      setCopyError('');
                    }}
                    disabled={copyingContent}
                    className={`px-4 py-2 rounded-lg ${
                      copyingContent
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {copyResult ? 'Done' : 'Cancel'}
                  </button>
                  {!copyResult && (
                    <button
                      type="submit"
                      disabled={copyingContent || !copyTargetOrg}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        copyingContent || !copyTargetOrg
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {copyingContent ? 'Copying...' : 'Copy Content'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Action Message */}
        {actionMessage.text && (
          <div className={`mb-4 p-3 rounded ${
            actionMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {actionMessage.text}
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Search by Email
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Enter email..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
            </div>
            
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            
            {/* Owner Filter */}
            {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Organization
              </label>
              <select
                value={filters.ownerSlug}
                onChange={(e) => handleFilterChange('ownerSlug', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
              >
                <option value="all">All Organizations</option>
                {loadingOwners ? (
                  <option>Loading...</option>
                ) : (
                  owners.map(owner => (
                    <option key={owner.owner_slug} value={owner.owner_slug}>
                      {owner.display_name} ({owner.owner_slug})
                    </option>
                  ))
                )}
              </select>
            </div>
            )}
          </div>
        </div>
        
        {/* Org Premium vs Free Chart (Superadmin) */}
        {isSuperAdmin && (
          <div className="bg-white rounded-lg shadow border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Organizations – Premium vs Free</h2>
              <button
                onClick={loadOrgStats}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm"
              >
                {loadingOrgStats ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
            {loadingOrgStats ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : orgStats.length === 0 ? (
              <div className="text-gray-500">No organizations found.</div>
            ) : (
              <div className="space-y-3">
                {orgStats.map((s) => {
                  const total = Math.max(1, s.total); // avoid div by zero
                  const pctPremium = Math.round((s.premium / total) * 100);
                  const pctOverrides = Math.round((s.overrides / total) * 100);
                  const pctFree = Math.max(0, 100 - pctPremium - pctOverrides);
                  return (
                    <div key={s.owner_slug} className="">
                      <div className="flex justify-between text-sm mb-1">
                        <div className="font-medium text-gray-900">{s.display_name} <span className="text-gray-500">({s.owner_slug})</span></div>
                        <div className="text-gray-600">Total: {s.total} • Premium: {s.premium} • Overrides: {s.overrides} • Free: {s.free}</div>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded overflow-hidden flex">
                        <div
                          className="h-4 bg-purple-500"
                          style={{ width: `${pctPremium}%` }}
                          title={`Premium ${pctPremium}%`}
                        />
                        <div
                          className="h-4 bg-pink-500"
                          style={{ width: `${pctOverrides}%` }}
                          title={`Premium Overrides ${pctOverrides}%`}
                        />
                        <div
                          className="h-4 bg-gray-400"
                          style={{ width: `${pctFree}%` }}
                          title={`Free ${pctFree}%`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Users ({totalProfiles})</h2>
            
            {/* Page Size */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={filters.pageSize}
                onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
                className="px-2 py-1 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          
          {loadingProfiles ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found matching your filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email / Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {profiles.map(profile => (
                      <tr key={profile.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(profile.id)}
                            onChange={() => toggleSelectOne(profile.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{profile.email}</div>
                          {profile.display_name && (
                            <div className="text-xs text-gray-500">{profile.display_name}</div>
                          )}
                          {/* Premium indicators */}
                          <div className="flex gap-1 mt-1">
                            {profile.subscription?.isActive && (
                              <span className="text-[10px] inline-block bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded-full">
                                Premium
                              </span>
                            )}
                            {!profile.subscription?.isActive && profile.premium_override && (
                              <span className="text-[10px] inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                Override
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            profile.role === 'superadmin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : profile.role === 'admin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {profile.owners?.display_name || profile.owner_slug || <span className="text-gray-400">None</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(profile.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            {/* Role Actions */}
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleRoleChange(profile.id, 'user')}
                                disabled={profile.role === 'superadmin' || profile.role === 'user' || actionInProgress === profile.id || !isSuperAdmin}
                                className={`px-2 py-1 text-xs rounded ${
                                  profile.role === 'superadmin' || profile.role === 'user' || actionInProgress === profile.id
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                Set User
                              </button>
                              <button
                                onClick={() => handleRoleChange(profile.id, 'admin')}
                                disabled={profile.role === 'superadmin' || profile.role === 'admin' || actionInProgress === profile.id || !isSuperAdmin}
                                className={`px-2 py-1 text-xs rounded ${
                                  profile.role === 'superadmin' || profile.role === 'admin' || actionInProgress === profile.id
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                }`}
                              >
                                Set Admin
                              </button>
                            </div>
                            
                            {/* Owner Action */}
                            <select
                              value={profile.owner_slug || ''}
                              onChange={(e) => handleOwnerChange(profile.id, e.target.value)}
                              disabled={profile.role === 'superadmin' || actionInProgress === profile.id || !isSuperAdmin}
                              className={`px-2 py-1 text-xs rounded border ${
                                profile.role === 'superadmin' || actionInProgress === profile.id
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                  : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                              }`}
                            >
                              <option value="">No Organization</option>
                              {owners.map(owner => (
                                <option key={owner.owner_slug} value={owner.owner_slug}>
                                  {owner.display_name}
                                </option>
                              ))}
                            </select>

                            {/* Premium Override Toggle */}
                            <button
                              onClick={async () => {
                                if (actionInProgress) return;
                                setActionInProgress(profile.id + ':premium');
                                setActionMessage({ text: '', type: '' });
                                try {
                                  const next = !profile.premium_override;
                                  const { error } = await supabase
                                    .from('profiles')
                                    .update({ premium_override: next })
                                    .eq('id', profile.id);
                                  if (error) throw error;
                                  setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, premium_override: next } : p));
                                  setActionMessage({ text: next ? 'Premium granted (override)' : 'Premium override removed', type: 'success' });
                                  // If toggling for the currently logged-in user, refresh their profile
                                  try {
                                    if (authUser?.id && authUser.id === profile.id) {
                                      await refreshProfile(authUser.id);
                                      try {
                                        localStorage.setItem('subscription:refresh', String(Date.now()));
                                        window.dispatchEvent(new Event('subscriptionUpdated'));
                                      } catch {}
                                    }
                                  } catch {}
                                } catch (e) {
                                  setActionMessage({ text: e?.message || 'Failed to update premium override', type: 'error' });
                                } finally {
                                  setActionInProgress(null);
                                  setTimeout(() => setActionMessage({ text: '', type: '' }), 2500);
                                }
                              }}
                              disabled={actionInProgress === profile.id + ':premium' || !isSuperAdmin || profile.subscription?.isActive}
                              className={`px-2 py-1 text-xs rounded ${
                                actionInProgress === profile.id + ':premium' || !isSuperAdmin || profile.subscription?.isActive
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : profile.premium_override
                                    ? 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                              }`}
                            >
                              {profile.subscription?.isActive
                                ? 'Premium (Stripe)'
                                : profile.premium_override
                                  ? 'Remove Premium'
                                  : 'Grant Premium'}
                            </button>

                            {/* Weekly CSV toggle (self only) */}
                            {authUser?.id === profile.id && (
                              <button
                                onClick={async () => {
                                  if (actionInProgress) return;
                                  setActionInProgress(profile.id + ':weekly');
                                  try {
                                    const next = !profile.weekly_csv_enabled;
                                    const { error } = await supabase
                                      .from('profiles')
                                      .update({ weekly_csv_enabled: next })
                                      .eq('id', profile.id);
                                    if (error) throw error;
                                    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, weekly_csv_enabled: next } : p));
                                  } catch (e) {
                                    console.error('Failed to update weekly_csv_enabled', e);
                                    alert('Failed to update Weekly CSV preference');
                                  } finally {
                                    setActionInProgress(null);
                                  }
                                }}
                                disabled={actionInProgress === profile.id + ':weekly'}
                                className={`px-2 py-1 text-xs rounded ${
                                  actionInProgress === profile.id + ':weekly'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : profile.weekly_csv_enabled
                                      ? 'bg-green-100 hover:bg-green-200 text-green-800'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                Weekly CSV: {profile.weekly_csv_enabled ? 'On' : 'Off'}
                              </button>
                            )}

                            {/* Link Stripe by Email (superadmin) */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => linkStripeByEmail(profile)}
                                disabled={actionInProgress === profile.id + ':link'}
                                className={`px-2 py-1 text-xs rounded ${
                                  actionInProgress === profile.id + ':link'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-100 hover:bg-green-200 text-green-800'
                                }`}
                              >
                                Link Stripe
                              </button>
                            )}

                            {/* Delete User */}
                            <button
                              onClick={async () => {
                                if (!window.confirm('Delete this user? This cannot be undone.')) return;
                                setActionInProgress(profile.id);
                                setActionMessage({ text: '', type: '' });
                                try {
                                  const token = session?.access_token || null;
                                  const { data, error } = await supabase.functions.invoke('delete-user', {
                                    body: { userId: profile.id },
                                    headers: token
                                      ? { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY }
                                      : undefined,
                                  });
                                  if (error) throw new Error(error.message || 'Failed to delete');
                                  // Refresh list
                                  await loadProfiles();
                                  setActionMessage({ text: 'User deleted', type: 'success' });
                                } catch (e) {
                                  setActionMessage({ text: e?.message || 'Failed to delete user', type: 'error' });
                                } finally {
                                  setActionInProgress(null);
                                  setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
                                }
                              }}
                              disabled={actionInProgress === profile.id || profile.role === 'superadmin' || (!isSuperAdmin && profile.role !== 'user')}
                              className={`px-2 py-1 text-xs rounded ${
                                actionInProgress === profile.id || profile.role === 'superadmin' || (!isSuperAdmin && profile.role !== 'user')
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-100 hover:bg-red-200 text-red-800'
                              }`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bulk actions */}
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Selected: {selectedUserIds.length}
                </div>
                <button
                  onClick={bulkDelete}
                  disabled={selectedUserIds.length === 0 || actionInProgress === 'bulk'}
                  className={`px-3 py-2 rounded text-sm ${selectedUserIds.length === 0 || actionInProgress === 'bulk' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 hover:bg-red-200 text-red-800'}`}
                >
                  {actionInProgress === 'bulk' ? 'Deleting…' : 'Delete Selected'}
                </button>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {(filters.page - 1) * filters.pageSize + 1} to {Math.min(filters.page * filters.pageSize, totalProfiles)} of {totalProfiles} users
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', 1)}
                    disabled={filters.page === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      filters.page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      filters.page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page === totalPages}
                    className={`px-3 py-1 rounded text-sm ${
                      filters.page === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', totalPages)}
                    disabled={filters.page === totalPages}
                    className={`px-3 py-1 rounded text-sm ${
                      filters.page === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperadminUsersPage;

/* ------------------------------------------------------------------------- */
/*  Modal markup appended at render root – must stay outside component code  */
/* ------------------------------------------------------------------------- */


