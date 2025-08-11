import React, { useState, useEffect, useMemo } from 'react';
import { characterRepository } from '../../repositories/characterRepository';
import { supabase } from '../../services/supabase';
import { getMyProfile } from '../../services/invitesService';
import {
  getSettings as getTierSettings,
  setSettings as setTierSettings,
  getOwnerSlug,
} from '../../services/tierSettingsService';
import { loadAccountTierSettings } from '../../utils/accountTier';

/**
 * Account Tier Management Component
 * 
 * Allows administrators to configure:
 * - Character access limits for free accounts
 * - Message limits per conversation for free accounts
 * - Which characters are free vs premium-only
 */
const AccountTierManagement = () => {
  // Configuration state
  const [freeMessageLimit, setFreeMessageLimit] = useState(5);
  const [freeCharacterLimit, setFreeCharacterLimit] = useState(10);
  const [characters, setCharacters] = useState([]);
  const [freeCharacters, setFreeCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  /* ------------------------------------------------------------------
   * UI helpers
   * ---------------------------------------------------------------- */
  const [query, setQuery] = useState('');
  /* Pagination */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  /* Owner slug for multi-tenant settings */
  const [ownerSlug, setOwnerSlug] = useState('default');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [owners, setOwners] = useState([]);

  /**
   * Fetch and normalise settings for provided slug
   */
  const fetchSettings = async (slug, allCharacters = []) => {
    try {
      const supabaseSettings = await getTierSettings(slug);
      if (supabaseSettings) {
        setFreeMessageLimit(supabaseSettings.freeMessageLimit || 5);
        setFreeCharacterLimit(supabaseSettings.freeCharacterLimit || 10);
        setFreeCharacters(supabaseSettings.freeCharacters || []);

        // If none selected create default first-5
        if (
          (supabaseSettings.freeCharacters || []).length === 0 &&
          allCharacters.length > 0
        ) {
          setFreeCharacters(allCharacters.slice(0, 5).map((c) => c.id));
        }
        return;
      }

      // Fallback to local scoped cache (utils already handles env defaults)
      const local = loadAccountTierSettings();
      setFreeMessageLimit(local.freeMessageLimit || 5);
      setFreeCharacterLimit(local.freeCharacterLimit || 10);
      setFreeCharacters(local.freeCharacters || []);
    } catch (err) {
      console.error('Failed to fetch tier settings:', err);
    }
  };

  // Load characters, owners list & initial settings
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load characters
        const allCharacters = await characterRepository.getAll();
        setCharacters(allCharacters);

        // Get the current owner slug
        const slug = getOwnerSlug();
        setOwnerSlug(slug);

        // Determine current user role
        try {
          const { data: profile } = await getMyProfile();
          const superAdmin = profile?.role === 'superadmin';
          setIsSuperAdmin(superAdmin);

          // Load owners list if superadmin
          if (superAdmin) {
            const { data: ownersData } = await supabase
              .from('owners')
              .select('owner_slug, display_name')
              .order('display_name');
            setOwners(ownersData || []);
          }
        } catch (pErr) {
          console.error('Error loading profile/owners:', pErr);
        }

        // finally, fetch settings
        await fetchSettings(slug, allCharacters);
      } catch (error) {
        console.error('Failed to load data:', error);
        setSaveMessage({
          type: 'error',
          text: 'Failed to load configuration data'
        });
        
        // Try to load from localStorage as fallback on error
        try {
          const savedSettings = localStorage.getItem('accountTierSettings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setFreeMessageLimit(settings.freeMessageLimit || 5);
            setFreeCharacterLimit(settings.freeCharacterLimit || 10);
            setFreeCharacters(settings.freeCharacters || []);
          }
        } catch (e) {
          console.error('Failed to load from localStorage fallback:', e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /* Reload settings whenever the selected owner changes */
  useEffect(() => {
    fetchSettings(ownerSlug, characters);
  }, [ownerSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save settings to Supabase and localStorage
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      /* ------------------------------------------------------------------
       * Build the list of free character **names** that correspond to the
       * currently-selected freeCharacters IDs.  This name-based fallback
       * helps the client match premium/free status even when ID types
       * (number vs string/UUID) differ across data sources.
       * ---------------------------------------------------------------- */
      const freeNames = characters
        .filter(char => freeCharacters.includes(char.id))
        .map(char => char.name);

      const settings = {
        freeMessageLimit,
        freeCharacterLimit,
        freeCharacters,
        freeCharacterNames: freeNames,
        lastUpdated: new Date().toISOString()
      };
      
      // Save to Supabase via tierSettingsService
      const saveSuccess = await setTierSettings(settings, ownerSlug);

      /* --------------------------------------------------------------
       * Notify other components (same tab) that tier settings changed.
       * This allows contexts listening for the event to update instantly
       * without relying on the cross-tab "storage" event (which does not
       * fire in the origin tab where setItem is called).
       * ------------------------------------------------------------ */
      try {
        window.dispatchEvent(new Event('accountTierSettingsChanged'));
      } catch (_) {
        /* no-op – older browsers may throw, ignore */
      }

      setSaveMessage({
        type: saveSuccess ? 'success' : 'warning',
        text: saveSuccess 
          ? 'Settings saved successfully to Supabase and localStorage!' 
          : 'Settings saved to localStorage only. Supabase update failed.'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage({
        type: 'error',
        text: 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset settings to defaults
  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setFreeMessageLimit(5);
      setFreeCharacterLimit(10);
      
      // Make the first 5 characters free by default
      const defaultFreeCharacters = characters
        .slice(0, 5)
        .map(char => char.id);
      setFreeCharacters(defaultFreeCharacters);
      
      setSaveMessage({
        type: 'info',
        text: 'Settings reset to defaults. Click Save to apply changes.'
      });
    }
  };

  // Toggle a character's free/premium status
  const toggleCharacterStatus = (characterId) => {
    setFreeCharacters(prev => {
      if (prev.includes(characterId)) {
        // Remove from free characters (make premium)
        return prev.filter(id => id !== characterId);
      } else {
        // Add to free characters
        return [...prev, characterId];
      }
    });
  };

  // Check if we've exceeded the free character limit
  const isFreeLimitExceeded = freeCharacters.length > freeCharacterLimit;

  /* ------------------------------------------------------------------
   * Bulk-selection helpers
   * ---------------------------------------------------------------- */
  const selectAll = () => {
    setFreeCharacters(characters.map((c) => c.id));
  };

  const deselectAll = () => {
    setFreeCharacters([]);
  };

  /* ------------------------------------------------------------
   * Derived filtered list based on search query
   * ---------------------------------------------------------- */
  const filteredCharacters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((c) =>
      (c.name || '').toLowerCase().includes(q),
    );
  }, [characters, query]);

  /* ------------------------------------------------------------
   * Paging slice
   * ---------------------------------------------------------- */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCharacters.length / pageSize),
  );
  const startIdx = (page - 1) * pageSize;
  const pagedCharacters = useMemo(
    () => filteredCharacters.slice(startIdx, startIdx + pageSize),
    [filteredCharacters, startIdx, pageSize],
  );

  /* Reset page when query or pageSize changes */
  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  /* Toggle free/premium just for the currently visible set */
  const invertVisible = () => {
    const visibleIds = new Set(pagedCharacters.map((c) => c.id));
    setFreeCharacters((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      });
      return Array.from(next);
    });
  };

  /* Select / deselect only currently visible page */
  const selectVisible = () => {
    const ids = pagedCharacters.map((c) => c.id);
    setFreeCharacters((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const deselectVisible = () => {
    const visible = new Set(pagedCharacters.map((c) => c.id));
    setFreeCharacters((prev) => prev.filter((id) => !visible.has(id)));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Account Tier Management
      </h2>

      {/* ────────────────────────────────────────────────
       *  Organisation selector (superadmin only)
       * ──────────────────────────────────────────────── */}
      {isSuperAdmin && (
        <div className="mb-6">
          <label
            htmlFor="ownerSelector"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Organization
          </label>
          <select
            id="ownerSelector"
            value={ownerSlug}
            onChange={(e) => {
              const newSlug = e.target.value;
              setOwnerSlug(newSlug);
              try {
                localStorage.setItem('ownerSlug', newSlug);
              } catch (_) {
                /* ignore */
              }
              setPage(1); // reset paging when org changes
            }}
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Ensure 'default' is always present */}
            {!owners.some((o) => o.owner_slug === 'default') && (
              <option value="default">default</option>
            )}
            {owners.map((o) => (
              <option key={o.owner_slug} value={o.owner_slug}>
                {o.display_name || o.owner_slug} ({o.owner_slug})
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Free Account Limits */}
          {/* Free Account Limits */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Free Account Limits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Message Limit */}
              <div className="space-y-2">
                <label htmlFor="messageLimit" className="block text-sm font-medium text-gray-700">
                  Message Limit per Conversation
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="messageLimit"
                    min="1"
                    max="50"
                    value={freeMessageLimit}
                    onChange={(e) => setFreeMessageLimit(parseInt(e.target.value) || 1)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">messages</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Free users will be limited to this many messages per conversation before being prompted to upgrade.
                </p>
              </div>

              {/* Character Limit */}
              <div className="space-y-2">
                <label htmlFor="characterLimit" className="block text-sm font-medium text-gray-700">
                  Free Character Limit
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="characterLimit"
                    min="1"
                    max={characters.length}
                    value={freeCharacterLimit}
                    onChange={(e) => setFreeCharacterLimit(parseInt(e.target.value) || 1)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">characters</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Maximum number of characters that can be set as free. Currently {freeCharacters.length} of {freeCharacterLimit} selected.
                </p>
                {isFreeLimitExceeded && (
                  <p className="text-sm text-red-600 font-medium">
                    Warning: You've selected {freeCharacters.length} free characters, which exceeds your limit of {freeCharacterLimit}.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Character Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              Character Access Settings
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which characters are available to free users. All other characters will require a premium subscription.
            </p>

            {/* Search */}
            <div className="mb-3 flex items-center gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search characters..."
                className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Showing: {filteredCharacters.length}
              </span>
              {/* Page size selector */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10) || 25);
                  setPage(1);
                }}
                className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Page {page} of {totalPages}
              </span>
            </div>

            {/* Bulk controls */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50"
              >
                Select All ({characters.length})
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={invertVisible}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50"
              >
                Invert Visible
              </button>
              <button
                type="button"
                onClick={selectVisible}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50"
              >
                Select Visible
              </button>
              <button
                type="button"
                onClick={deselectVisible}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50"
              >
                Deselect Visible
              </button>
              <span className="ml-auto text-sm text-gray-600">
                Selected: {freeCharacters.length} / {characters.length}
              </span>
            </div>

            {/* Character list with checkboxes */}
            <div className="border rounded-md divide-y overflow-hidden">
              {pagedCharacters.map((character) => {
                const checked = freeCharacters.includes(character.id);
                return (
                  <label
                    key={character.id}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={checked}
                      onChange={() => toggleCharacterStatus(character.id)}
                    />
                    <img
                      src={
                        character.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          character.name,
                        )}`
                      }
                      alt={character.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="flex-1 truncate text-sm text-gray-900">
                      {character.name}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        checked
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {checked ? 'Free' : 'Premium'}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-600">
                Showing {filteredCharacters.length === 0 ? 0 : startIdx + 1}
                –{startIdx + pagedCharacters.length} of{' '}
                {filteredCharacters.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className={`px-2 py-1 text-sm rounded border ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-2 py-1 text-sm rounded border ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-2 py-1 text-sm rounded border ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className={`px-2 py-1 text-sm rounded border ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
          </div>

          {/* Save/Reset Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={resetSettings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset to Defaults
            </button>
            
            <div className="flex items-center space-x-4">
              {saveMessage.text && (
                <div className={`text-sm ${
                  saveMessage.type === 'success' ? 'text-green-600' :
                  saveMessage.type === 'error' ? 'text-red-600' : 
                  saveMessage.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`}>
                  {saveMessage.text}
                </div>
              )}
              
              <button
                type="button"
                onClick={saveSettings}
                disabled={isSaving}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                  ${isSaving 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                `}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Settings'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountTierManagement;
