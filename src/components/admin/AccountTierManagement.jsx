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
import {
  roundtableSettingsRepository,
  DEFAULT_ROUNDTABLE_SETTINGS,
} from '../../repositories/roundtableSettingsRepository';
import { bibleStudiesRepository } from '../../repositories/bibleStudiesRepository';

/**
 * Account Tier Management Component
 * 
 * Allows administrators to configure:
 * - Character access limits for free accounts
 * - Message limits per conversation for free accounts
 * - Which characters are free vs premium-only
 * - Featured character for the organization
 */
const AccountTierManagement = ({ mode = 'full' }) => {
  // Configuration state
  const [freeMessageLimit, setFreeMessageLimit] = useState(5);
  const [freeCharacterLimit, setFreeCharacterLimit] = useState(10);
  const [characters, setCharacters] = useState([]);
  const [freeCharacters, setFreeCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  /* Premium gates */
  const [premiumGates, setPremiumGates] = useState({
    allowAllSpeak: false,
    strictRotation: false,
    followUpsMin: null,
    repliesPerRoundMin: null,
  });
  const [premiumStudyIds, setPremiumStudyIds] = useState([]);
  const [studies, setStudies] = useState([]);
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
  /* Featured character state */
  const [allCharacters, setAllCharacters] = useState([]);
  const [featuredId, setFeaturedId] = useState('');
  const [featuredSaving, setFeaturedSaving] = useState(false);
  const [featuredSaveMessage, setFeaturedSaveMessage] = useState({ type: '', text: '' });

  /* ──────────────────────────────────────────────────────────────
   *  Roundtable tab state
   * ──────────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState(mode === 'roundtable-only' ? 'roundtable' : 'tier'); // 'tier' | 'roundtable'
  const [rtLoading, setRtLoading] = useState(false);
  const [rtSaving, setRtSaving] = useState(false);
  const [rtMessage, setRtMessage] = useState({ type: '', text: '' });
  const [rtDefaults, setRtDefaults] = useState(
    DEFAULT_ROUNDTABLE_SETTINGS.defaults,
  );
  const [rtLimits, setRtLimits] = useState(DEFAULT_ROUNDTABLE_SETTINGS.limits);
  const [rtLocks, setRtLocks] = useState(DEFAULT_ROUNDTABLE_SETTINGS.locks);
  const [rtLimitsTier, setRtLimitsTier] = useState('free'); // 'free' | 'premium'
  
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
        setPremiumGates({
          allowAllSpeak: !!supabaseSettings?.premiumRoundtableGates?.allowAllSpeak,
          strictRotation: !!supabaseSettings?.premiumRoundtableGates?.strictRotation,
          followUpsMin: supabaseSettings?.premiumRoundtableGates?.followUpsMin ?? null,
          repliesPerRoundMin: supabaseSettings?.premiumRoundtableGates?.repliesPerRoundMin ?? null,
        });
        setPremiumStudyIds(Array.isArray(supabaseSettings?.premiumStudyIds) ? supabaseSettings.premiumStudyIds : []);

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
      setPremiumGates(local.premiumRoundtableGates || premiumGates);
      setPremiumStudyIds(local.premiumStudyIds || []);
    } catch (err) {
      console.error('Failed to fetch tier settings:', err);
    }
  };

  /**
   * Load featured character for the given owner slug
   */
  const loadFeaturedCharacter = (slug) => {
    try {
      const key = `featuredCharacter:${slug}`;
      const raw = localStorage.getItem(key);
      
      if (!raw) {
        setFeaturedId('');
        return;
      }

      try {
        // Try to parse as JSON
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null && parsed.id) {
          setFeaturedId(parsed.id);
          return;
        }
      } catch {
        // Not JSON, treat as plain string
        if (/^\d+$/.test(raw)) {
          // If it's a numeric string, treat as ID
          setFeaturedId(raw);
        } else {
          // Otherwise, try to find character by name
          const character = allCharacters.find(c => 
            (c.name || '').toLowerCase() === (raw || '').toLowerCase()
          );
          if (character) {
            setFeaturedId(character.id);
          } else {
            setFeaturedId('');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load featured character:', err);
      setFeaturedId('');
    }
  };

  // Load characters, owners list & initial settings
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load characters
        const allChars = await characterRepository.getAll();
        setCharacters(allChars);
        setAllCharacters(allChars);

        // Load studies for this org for Premium selection
        try {
          const st = await bibleStudiesRepository.listStudies({ ownerSlug: getOwnerSlug(), includePrivate: true });
          setStudies(st || []);
        } catch (e) {
          console.warn('Failed to load studies list:', e);
          setStudies([]);
        }

        // Get the current owner slug
        const slug = getOwnerSlug();
        setOwnerSlug(slug);

        // Load featured character
        loadFeaturedCharacter(slug);

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
        await fetchSettings(slug, allChars);

        /* ---------------- Roundtable settings ----------------- */
        try {
          setRtLoading(true);
          const rts = await roundtableSettingsRepository.getByOwnerSlug(slug);
          if (rts) {
            setRtDefaults({
              ...DEFAULT_ROUNDTABLE_SETTINGS.defaults,
              ...rts.defaults,
            });
            setRtLimits({
              ...DEFAULT_ROUNDTABLE_SETTINGS.limits,
              ...rts.limits,
            });
            setRtLocks({
              ...DEFAULT_ROUNDTABLE_SETTINGS.locks,
              ...rts.locks,
            });
          }
        } catch (e) {
          console.error('Failed to load roundtable settings:', e);
        } finally {
          setRtLoading(false);
        }
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
    loadFeaturedCharacter(ownerSlug);
    (async () => {
      try {
        setRtLoading(true);
        const rts = await roundtableSettingsRepository.getByOwnerSlug(
          ownerSlug,
        );
        if (rts) {
          setRtDefaults({
            ...DEFAULT_ROUNDTABLE_SETTINGS.defaults,
            ...rts.defaults,
          });
          setRtLimits({
            ...DEFAULT_ROUNDTABLE_SETTINGS.limits,
            ...rts.limits,
          });
          setRtLocks({
            ...DEFAULT_ROUNDTABLE_SETTINGS.locks,
            ...rts.locks,
          });
        }
      } catch (e) {
        console.error('Failed to reload roundtable settings:', e);
      } finally {
        setRtLoading(false);
      }
    })();
  }, [ownerSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ──────────────────────────────────────────────────────────────
   *  Roundtable helpers
   * ──────────────────────────────────────────────────────────── */
  const saveRoundtableSettings = async () => {
    setRtSaving(true);
    try {
      await roundtableSettingsRepository.upsertByOwnerSlug(ownerSlug, {
        defaults: rtDefaults,
        limits: rtLimits,
        locks: rtLocks
      });
      setRtMessage({ type: 'success', text: 'Roundtable settings saved' });
    } catch (e) {
      setRtMessage({
        type: 'error',
        text: e?.message || 'Failed to save roundtable settings',
      });
    } finally {
      setRtSaving(false);
      setTimeout(() => setRtMessage({ type: '', text: '' }), 3000);
    }
  };

  const resetRoundtableToDefaults = () => {
    setRtDefaults(DEFAULT_ROUNDTABLE_SETTINGS.defaults);
    setRtLimits(DEFAULT_ROUNDTABLE_SETTINGS.limits);
    setRtLocks(DEFAULT_ROUNDTABLE_SETTINGS.locks);
    setRtMessage({
      type: 'info',
      text: 'Roundtable defaults restored. Click Save to apply.',
    });
  };

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
        lastUpdated: new Date().toISOString(),
        premiumRoundtableGates: premiumGates,
        premiumStudyIds: premiumStudyIds,
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

  // Save featured character to localStorage
  const saveFeaturedCharacter = () => {
    setFeaturedSaving(true);
    try {
      const key = `featuredCharacter:${ownerSlug}`;
      
      if (!featuredId) {
        // If no character is selected, remove the featured character
        localStorage.removeItem(key);
        setFeaturedSaveMessage({
          type: 'success',
          text: 'Featured character removed'
        });
      } else {
        // Find the character object
        const character = allCharacters.find(c => c.id === featuredId);
        if (!character) {
          setFeaturedSaveMessage({
            type: 'error',
            text: 'Character not found'
          });
          return;
        }

        // Save as JSON with id and name
        const data = JSON.stringify({
          id: character.id,
          name: character.name
        });
        localStorage.setItem(key, data);

        // Trigger storage event for cross-tab sync
        try {
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: data
            })
          );
        } catch (_) {
          /* ignore */
        }

        setFeaturedSaveMessage({
          type: 'success',
          text: `${character.name} set as featured character`
        });
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFeaturedSaveMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Failed to save featured character:', error);
      setFeaturedSaveMessage({
        type: 'error',
        text: 'Failed to save featured character'
      });
    } finally {
      setFeaturedSaving(false);
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
        {mode === "roundtable-only" ? "Roundtable Settings" : "Account Tier Management"}
      </h2>

      {/* Tab bar (hidden when used in roundtable-only mode) */}
      {mode === 'full' && (
        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setActiveTab('tier')}
            className={`pb-2 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'tier'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Tier & Featured
          </button>
        </div>
      )}

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
          {mode === 'full' && activeTab === 'tier' && (
            <>
              {/* Premium Gates Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Premium Gates</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Mark specific features as Premium-only for this organization.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Roundtable Feature Gates */}
                  <div className="space-y-3 p-4 border rounded-md">
                    <h4 className="font-medium text-blue-800 mb-1">Roundtable Options</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={!!premiumGates.allowAllSpeak}
                        onChange={(e) => setPremiumGates({ ...premiumGates, allowAllSpeak: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">All-Speak requires Premium</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={!!premiumGates.strictRotation}
                        onChange={(e) => setPremiumGates({ ...premiumGates, strictRotation: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Strict Rotation requires Premium</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Follow-Ups min for Premium</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={premiumGates.followUpsMin ?? ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? null : (parseInt(e.target.value, 10) || 0);
                            setPremiumGates({ ...premiumGates, followUpsMin: v });
                          }}
                          placeholder="e.g. 1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Any follow-ups ≥ this value require Premium. Leave blank to disable.</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Replies Per Round above</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={premiumGates.repliesPerRoundMin ?? ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? null : (parseInt(e.target.value, 10) || 1);
                            setPremiumGates({ ...premiumGates, repliesPerRoundMin: v });
                          }}
                          placeholder="e.g. 3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Replies above this number require Premium. Leave blank to disable.</p>
                      </div>
                    </div>
                  </div>

                  {/* Premium Studies */}
                  <div className="space-y-3 p-4 border rounded-md">
                    <h4 className="font-medium text-blue-800 mb-1">Premium Bible Studies</h4>
                    <p className="text-xs text-gray-600">Select studies that require Premium access.</p>
                    <div className="max-h-60 overflow-y-auto border rounded">
                      {studies.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">No studies found for this organization.</div>
                      ) : (
                        studies.map((s) => {
                          const checked = premiumStudyIds.includes(s.id);
                          return (
                            <label key={s.id} className="flex items-center gap-2 p-2 border-b last:border-b-0">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                checked={checked}
                                onChange={(e) => {
                                  setPremiumStudyIds((prev) => (
                                    e.target.checked ? Array.from(new Set([...prev, s.id])) : prev.filter((id) => id !== s.id)
                                  ));
                                }}
                              />
                              <span className="text-sm text-gray-800">{s.title}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Featured Character Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Featured Character</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select a character to feature on the homepage for this organization.
                </p>
                
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-grow">
                    <label htmlFor="featuredCharacter" className="block text-sm font-medium text-gray-700 mb-1">
                      Featured Character
                    </label>
                    <select
                      id="featuredCharacter"
                      value={featuredId}
                      onChange={(e) => setFeaturedId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None - No featured character</option>
                      {allCharacters.map((char) => (
                        <option key={char.id} value={char.id}>
                          {char.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {featuredSaveMessage.text && (
                      <div className={`text-sm ${
                        featuredSaveMessage.type === 'success' ? 'text-green-600' :
                        featuredSaveMessage.type === 'error' ? 'text-red-600' : 
                        featuredSaveMessage.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {featuredSaveMessage.text}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={saveFeaturedCharacter}
                      disabled={featuredSaving}
                      className={`
                        inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                        ${featuredSaving 
                          ? 'bg-blue-300 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                      `}
                    >
                      {featuredSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Featured Character'}
                    </button>
                  </div>
                </div>
                
                {featuredId && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center gap-3">
                      {allCharacters.find(c => c.id === featuredId) && (
                        <>
                          <img
                            src={
                              allCharacters.find(c => c.id === featuredId)?.avatar_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                allCharacters.find(c => c.id === featuredId)?.name || ''
                              )}`
                            }
                            alt={allCharacters.find(c => c.id === featuredId)?.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-blue-900">
                              {allCharacters.find(c => c.id === featuredId)?.name}
                            </p>
                            <p className="text-sm text-blue-700">
                              Will be displayed on the homepage for {ownerSlug} organization
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

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

          {mode === 'roundtable-only' && (
            <>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Roundtable Settings</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure default settings, limits, and locks for roundtable discussions in this organization.
                  Roundtable discussions allow multiple biblical characters to respond to topics and interact with each other.
                </p>

                {rtLoading ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {/* Defaults Section */}
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-blue-700 mb-3">Default Settings</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        These settings will be applied as defaults when users create new roundtable discussions.
                        Users can adjust these within the allowed limits unless the feature is locked.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Replies Per Round */}
                        <div className="space-y-2">
                          <label htmlFor="repliesPerRound" className="block text-sm font-medium text-gray-700">
                            Replies Per Round
                          </label>
                          <input
                            type="number"
                            id="repliesPerRound"
                            min={rtLimits[rtLimitsTier].repliesPerRound.min}
                            max={rtLimits[rtLimitsTier].repliesPerRound.max}
                            value={rtDefaults.repliesPerRound}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              repliesPerRound: parseInt(e.target.value) || rtLimits[rtLimitsTier].repliesPerRound.min
                            })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                          />
                          <p className="text-xs text-gray-500">
                            Number of characters that will respond in each round. For example, with 3 replies, three different characters will speak in each round.
                            <br/>Min: {rtLimits[rtLimitsTier].repliesPerRound.min}, Max: {rtLimits[rtLimitsTier].repliesPerRound.max}
                          </p>
                        </div>

                        {/* Follow-Ups Per Round */}
                        <div className="space-y-2">
                          <label htmlFor="followUpsPerRound" className="block text-sm font-medium text-gray-700">
                            Follow-Ups Per Round
                          </label>
                          <input
                            type="number"
                            id="followUpsPerRound"
                            min={rtLimits[rtLimitsTier].followUpsPerRound.min}
                            max={rtLimits[rtLimitsTier].followUpsPerRound.max}
                            value={rtDefaults.followUpsPerRound}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              followUpsPerRound: parseInt(e.target.value) || rtLimits[rtLimitsTier].followUpsPerRound.min
                            })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                          />
                          <p className="text-xs text-gray-500">
                            Additional responses after main replies. These create natural back-and-forth discussion between characters.
                            <br/>Min: {rtLimits[rtLimitsTier].followUpsPerRound.min}, Max: {rtLimits[rtLimitsTier].followUpsPerRound.max}
                          </p>
                        </div>

                        {/* Max Words Per Reply */}
                        <div className="space-y-2">
                          <label htmlFor="maxWordsPerReply" className="block text-sm font-medium text-gray-700">
                            Max Words Per Reply
                          </label>
                          <input
                            type="number"
                            id="maxWordsPerReply"
                            min={rtLimits[rtLimitsTier].maxWordsPerReply.min}
                            max={rtLimits[rtLimitsTier].maxWordsPerReply.max}
                            value={rtDefaults.maxWordsPerReply}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              maxWordsPerReply: parseInt(e.target.value) || rtLimits[rtLimitsTier].maxWordsPerReply.min
                            })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                          />
                          <p className="text-xs text-gray-500">
                            Maximum words per character response. Higher values allow more detailed answers but can make discussions lengthy.
                            <br/>Min: {rtLimits[rtLimitsTier].maxWordsPerReply.min}, Max: {rtLimits[rtLimitsTier].maxWordsPerReply.max}
                          </p>
                        </div>

                        {/* Creativity */}
                        <div className="space-y-2">
                          <label htmlFor="creativity" className="block text-sm font-medium text-gray-700">
                            Creativity
                          </label>
                          <input
                            type="range"
                            id="creativity"
                            min={rtLimits[rtLimitsTier].creativity.min}
                            max={rtLimits[rtLimitsTier].creativity.max}
                            step="0.1"
                            value={rtDefaults.creativity}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              creativity: parseFloat(e.target.value) || rtLimits[rtLimitsTier].creativity.min
                            })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Conservative ({rtLimits[rtLimitsTier].creativity.min})</span>
                            <span className="text-xs text-gray-700 font-medium">{rtDefaults.creativity.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">Creative ({rtLimits[rtLimitsTier].creativity.max})</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Controls how strictly characters adhere to biblical text. Lower values produce more conservative responses based closely on scripture.
                          </p>
                        </div>

                        {/* Max Participants */}
                        <div className="space-y-2">
                          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                            Max Participants
                          </label>
                          <input
                            type="number"
                            id="maxParticipants"
                            min="2"
                            max={rtLimits[rtLimitsTier].maxParticipants}
                            value={rtDefaults.maxParticipants}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              maxParticipants: parseInt(e.target.value) || 2
                            })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                          />
                          <p className="text-xs text-gray-500">
                            Maximum number of characters in a roundtable. More participants create diverse discussions but each character speaks less frequently.
                            <br/>Max: {rtLimits[rtLimitsTier].maxParticipants}
                          </p>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <input
                            id="allowAllSpeak"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={rtDefaults.allowAllSpeak}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              allowAllSpeak: e.target.checked
                            })}
                            disabled={rtLocks.allowAllSpeak}
                          />
                          <label htmlFor="allowAllSpeak" className="ml-2 block text-sm text-gray-700">
                            Allow All-Speak Mode
                            {rtLocks.allowAllSpeak && <span className="ml-1 text-xs text-amber-600">(Locked)</span>}
                          </label>
                          <div className="ml-2">
                            <span
                              className="inline-block w-4 h-4 text-gray-400 cursor-help rounded-full bg-gray-100 text-center"
                              data-tooltip="When enabled, all characters respond to each user message. With this disabled, only the configured number of replies per round will occur."
                            >
                              ?
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="strictRotation"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={rtDefaults.strictRotation}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              strictRotation: e.target.checked
                            })}
                            disabled={rtLocks.strictRotation}
                          />
                          <label htmlFor="strictRotation" className="ml-2 block text-sm text-gray-700">
                            Strict Rotation
                            {rtLocks.strictRotation && <span className="ml-1 text-xs text-amber-600">(Locked)</span>}
                          </label>
                          <div className="ml-2">
                            <span
                              className="inline-block w-4 h-4 text-gray-400 cursor-help rounded-full bg-gray-100 text-center"
                              data-tooltip="When enabled, characters take turns in a fixed order. Otherwise, there's some randomness in who speaks next."
                            >
                              ?
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="enableAdvanceRound"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={rtDefaults.enableAdvanceRound}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              enableAdvanceRound: e.target.checked
                            })}
                            disabled={rtLocks.enableAdvanceRound}
                          />
                          <label htmlFor="enableAdvanceRound" className="ml-2 block text-sm text-gray-700">
                            Enable Advance Round
                            {rtLocks.enableAdvanceRound && <span className="ml-1 text-xs text-amber-600">(Locked)</span>}
                          </label>
                          <div className="ml-2">
                            <span
                              className="inline-block w-4 h-4 text-gray-400 cursor-help rounded-full bg-gray-100 text-center"
                              data-tooltip="Shows a button to advance to the next round without requiring user input. Characters will continue discussing the topic."
                            >
                              ?
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="saveByDefault"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={rtDefaults.saveByDefault}
                            onChange={(e) => setRtDefaults({
                              ...rtDefaults,
                              saveByDefault: e.target.checked
                            })}
                            disabled={rtLocks.saveByDefault}
                          />
                          <label htmlFor="saveByDefault" className="ml-2 block text-sm text-gray-700">
                            Save By Default
                            {rtLocks.saveByDefault && <span className="ml-1 text-xs text-amber-600">(Locked)</span>}
                          </label>
                          <div className="ml-2">
                            <span
                              className="inline-block w-4 h-4 text-gray-400 cursor-help rounded-full bg-gray-100 text-center"
                              data-tooltip="Automatically save roundtable discussions to the user's conversation history."
                            >
                              ?
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Limits Section */}
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-blue-700 mb-3">Limits</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        These settings define the minimum and maximum values users can select.
                        Different limits can be set for free and premium users.
                      </p>

                      {/* Tier selector */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Editing Limits For:
                        </label>
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setRtLimitsTier('free')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              rtLimitsTier === 'free'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            Free Users
                          </button>
                          <button
                            type="button"
                            onClick={() => setRtLimitsTier('premium')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              rtLimitsTier === 'premium'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            Premium Users
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {rtLimitsTier === 'free' 
                            ? 'Editing limits for free users. These should be more restrictive than premium limits.'
                            : 'Editing limits for premium users. These can be more generous than free limits.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Replies Per Round Limits */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Replies Per Round Limits
                          </label>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label htmlFor="repliesMin" className="block text-xs text-gray-500">Min</label>
                              <input
                                type="number"
                                id="repliesMin"
                                min="1"
                                max="5"
                                value={rtLimits[rtLimitsTier].repliesPerRound.min}
                                onChange={(e) => setRtLimits({
                                  ...rtLimits,
                                  [rtLimitsTier]: {
                                    ...rtLimits[rtLimitsTier],
                                    repliesPerRound: {
                                      ...rtLimits[rtLimitsTier].repliesPerRound,
                                      min: parseInt(e.target.value) || 1
                                    }
                                  }
                                })}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="repliesMax" className="block text-xs text-gray-500">Max</label>
                              <input
                                type="number"
                                id="repliesMax"
                                min="1"
                                max="10"
                                value={rtLimits[rtLimitsTier].repliesPerRound.max}
                                onChange={(e) => setRtLimits({
                                  ...rtLimits,
                                  [rtLimitsTier]: {
                                    ...rtLimits[rtLimitsTier],
                                    repliesPerRound: {
                                      ...rtLimits[rtLimitsTier].repliesPerRound,
                                      max: parseInt(e.target.value) || 1
                                    }
                                  }
                                })}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Recommended: Free (1-4), Premium (1-6)
                          </p>
                        </div>

                        {/* Follow-Ups Per Round Limits */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Follow-Ups Per Round Limits
                          </label>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label htmlFor="followUpsMin" className="block text-xs text-gray-500">Min</label>
                              <input
                                type="number"
                                id="followUpsMin"
                                min="0"
                                max="5"
                                value={rtLimits[rtLimitsTier].followUpsPerRound.min}
                                onChange={(e) => setRtLimits({
                                  ...rtLimits,
                                  [rtLimitsTier]: {
                                    ...rtLimits[rtLimitsTier],
                                    followUpsPerRound: {
                                      ...rtLimits[rtLimitsTier].followUpsPerRound,
                                      min: parseInt(e.target.value) || 0
                                    }
                                  }
                                })}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="followUpsMax" className="block text-xs text-gray-500">Max</label>
                              <input
                                type="number"
                                id="followUpsMax"
                                min="0"
                                max="10"
                                value={rtLimits[rtLimitsTier].followUpsPerRound.max}
                                onChange={(e) => setRtLimits({
                                  ...rtLimits,
                                  [rtLimitsTier]: {
                                    ...rtLimits[rtLimitsTier],
                                    followUpsPerRound: {
                                      ...rtLimits[rtLimitsTier].followUpsPerRound,
                                      max: parseInt(e.target.value) || 0
                                    }
                                  }
                                })}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Recommended: Free (0-2), Premium (0-3)
                          </p>
                        </div>

                        {/* Max Words Per Reply Limits */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Max Words Per Reply Limits
                          </label>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label htmlFor="wordsMin" className="block text-xs text-gray-500">Min</label>
                              <input
                                type="number"
                                id="wordsMin"
                                min="30"
                                max="100"
                                value={rtLimits[rtLimitsTier].maxWordsPerReply.min}
                                onChange={(e) => setRtLimits({
                                  ...rtLimits,
                                  [rtLimitsTier]: {
                                    ...rtLimits[rtLimitsTier],
                                    maxWordsPerReply: {
                                      ...rtLimits[rtLimitsTier].maxWordsPerReply,
                                      min: parseInt(e.target.value) || 30
                                    }
                                  }
                                })}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="wordsMax" className="block text-xs text-gray-500">Max</label>
                              <input
                                type="number"
                                id="wordsMax"
                                min="50"
                                max="300"
                                value={rtLimits[rtLimitsTier].maxWordsPerReply.max}
                                onChange={(e) => setRtLimits({
                                  ...rtLimits,
                                  [rtLimitsTier]: {
                                    ...rtLimits[rtLimitsTier],
                                    maxWordsPerReply: {
                                      ...rtLimits[rtLimitsTier].maxWordsPerReply,
                                      max: parseInt(e.target.value) || 50
                                    }
                                  }
                                })}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Recommended: Free (60-140), Premium (60-160)
                          </p>
                        </div>

                        {/* Creativity Limits */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Creativity Limits
                          </label>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label htmlFor="creativityMin" className="block text-xs text-gray-500">Min</label>
                              <input
                                type="number"
                                id="creativityMin"
                                min="0"
                                max="1"
                                step="0.1"
                                value={rtLimits[rtLimitsTier].creativity.min}
                                onChange={(e) => setRtLimits({
                                  ...rtLimits,
                                  [rtLimitsTier]: {
                                    ...rtLimits[rtLimitsTier],
                                    creativity: {
                                      ...rtLimits[rtLimitsTier].creativity,
                                      min: parseFloat(e.target.value) || 0
                                    }
                                  }
                                })}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="creativityMax" className="block text-xs text-gray-500">Max</label>
                              <input
                                type="number"
                                id="creativityMax"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={rtLimits[rtLimitsTier].creativity.max}
                                onChange={(e) => setRtLimits({
                                  ...rtLimits,
                                  [rtLimitsTier]: {
                                    ...rtLimits[rtLimitsTier],
                                    creativity: {
                                      ...rtLimits[rtLimitsTier].creativity,
                                      max: parseFloat(e.target.value) || 1
                                    }
                                  }
                                })}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Recommended: Free (0.2-0.9), Premium (0.2-1.0)
                          </p>
                        </div>

                        {/* Max Participants Limit */}
                        <div className="space-y-2">
                          <label htmlFor="maxParticipantsLimit" className="block text-sm font-medium text-gray-700">
                            Max Participants Limit
                          </label>
                          <input
                            type="number"
                            id="maxParticipantsLimit"
                            min="2"
                            max="20"
                            value={rtLimits[rtLimitsTier].maxParticipants}
                            onChange={(e) => setRtLimits({
                              ...rtLimits,
                              [rtLimitsTier]: {
                                ...rtLimits[rtLimitsTier],
                                maxParticipants: parseInt(e.target.value) || 2
                              }
                            })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md"
                          />
                          <p className="text-xs text-gray-500">
                            Maximum number of characters allowed in any roundtable.
                            <br/>Recommended: Free (8), Premium (12)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Locks Section */}
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-blue-700 mb-3">Feature Locks</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Lock features to prevent users from changing these settings.
                        Locked features will use the default values you've set above and cannot be modified by users.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <input
                            id="lockAllowAllSpeak"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={rtLocks.allowAllSpeak}
                            onChange={(e) => setRtLocks({
                              ...rtLocks,
                              allowAllSpeak: e.target.checked
                            })}
                          />
                          <label htmlFor="lockAllowAllSpeak" className="ml-2 block text-sm text-gray-700">
                            Lock All-Speak Mode
                          </label>
                          <div className="ml-2">
                            <span
                              className="inline-block w-4 h-4 text-gray-400 cursor-help rounded-full bg-gray-100 text-center"
                              data-tooltip="When locked, users cannot change the All-Speak setting. The default value set above will be used."
                            >
                              ?
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="lockStrictRotation"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={rtLocks.strictRotation}
                            onChange={(e) => setRtLocks({
                              ...rtLocks,
                              strictRotation: e.target.checked
                            })}
                          />
                          <label htmlFor="lockStrictRotation" className="ml-2 block text-sm text-gray-700">
                            Lock Strict Rotation
                          </label>
                          <div className="ml-2">
                            <span
                              className="inline-block w-4 h-4 text-gray-400 cursor-help rounded-full bg-gray-100 text-center"
                              data-tooltip="When locked, users cannot change the Strict Rotation setting. The default value set above will be used."
                            >
                              ?
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="lockEnableAdvanceRound"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={rtLocks.enableAdvanceRound}
                            onChange={(e) => setRtLocks({
                              ...rtLocks,
                              enableAdvanceRound: e.target.checked
                            })}
                          />
                          <label htmlFor="lockEnableAdvanceRound" className="ml-2 block text-sm text-gray-700">
                            Lock Advance Round
                          </label>
                          <div className="ml-2">
                            <span
                              className="inline-block w-4 h-4 text-gray-400 cursor-help rounded-full bg-gray-100 text-center"
                              data-tooltip="When locked, users cannot change the Advance Round setting. The default value set above will be used."
                            >
                              ?
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="lockSaveByDefault"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={rtLocks.saveByDefault}
                            onChange={(e) => setRtLocks({
                              ...rtLocks,
                              saveByDefault: e.target.checked
                            })}
                          />
                          <label htmlFor="lockSaveByDefault" className="ml-2 block text-sm text-gray-700">
                            Lock Save By Default
                          </label>
                          <div className="ml-2">
                            <span
                              className="inline-block w-4 h-4 text-gray-400 cursor-help rounded-full bg-gray-100 text-center"
                              data-tooltip="When locked, users cannot change the Save By Default setting. The default value set above will be used."
                            >
                              ?
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save/Reset Buttons */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={resetRoundtableToDefaults}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Reset to Defaults
                      </button>
                      
                      <div className="flex items-center space-x-4">
                        {rtMessage.text && (
                          <div className={`text-sm ${
                            rtMessage.type === 'success' ? 'text-green-600' :
                            rtMessage.type === 'error' ? 'text-red-600' : 
                            rtMessage.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                          }`}>
                            {rtMessage.text}
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={saveRoundtableSettings}
                          disabled={rtSaving}
                          className={`
                            inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                            ${rtSaving 
                              ? 'bg-blue-300 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                          `}
                        >
                          {rtSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : 'Save Roundtable Settings'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AccountTierManagement;
