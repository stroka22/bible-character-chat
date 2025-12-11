/**
 * Tier Settings Service
 * 
 * Handles loading and saving tier settings from Supabase with localStorage fallback.
 * Provides a consistent API for accessing tier settings across the application.
 */
import { supabase } from '../services/supabase';

// Table configuration
const TABLE_NAME = 'tier_settings';
/**
 * Build the per-organisation cache key. This keeps settings isolated
 * for each owner while remaining backward-compatible with the original
 * single-tenant key.
 * @param {string} slug
 * @returns {string}
 */
function getCacheKey(slug) {
  return `accountTierSettings:${slug}`;
}

/**
 * Get the current owner slug from environment variables, localStorage, or default
 * @returns {string} The owner slug to use for tier settings
 */
export function getOwnerSlug() {
  // Prefer runtime-selected org from AuthContext persisted to localStorage
  try {
    const ls = localStorage.getItem('ownerSlug');
    if (ls && String(ls).trim()) return String(ls).trim();
  } catch (_) { /* ignore */ }

  // Fallback to build-time env var (Vercel/Vite)
  const envSlug = import.meta?.env?.VITE_OWNER_SLUG;
  if (envSlug && String(envSlug).trim()) return String(envSlug).trim();

  // Final fallback to default org
  return 'default';
}

/**
 * List all known organization owner slugs.
 * Canonical source: distinct owner_slug from tier_settings.
 * Fallback: distinct owner_slug from bible_studies.
 * @returns {Promise<string[]>}
 */
export async function listOwnerSlugs() {
  const result = new Set();
  try {
    // Primary source – explicit org settings
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('owner_slug');
    if (!error && Array.isArray(data)) {
      for (const r of data) {
        const v = String(r?.owner_slug || '').trim().toLowerCase();
        if (v) result.add(v);
      }
    }
  } catch (e) {
    // non-fatal
  }

  // Fallback/augment – any orgs that already have studies
  try {
    const { data, error } = await supabase
      .from('bible_studies')
      .select('owner_slug');
    if (!error && Array.isArray(data)) {
      for (const r of data) {
        const v = String(r?.owner_slug || '').trim().toLowerCase();
        if (v) result.add(v);
      }
    }
  } catch (e) {
    // non-fatal
  }

  // Always include default
  result.add('default');

  return Array.from(result).sort();
}

/**
 * Normalize database record to match app expectations
 * @param {Object} record The database record
 * @returns {Object} Normalized settings object
 */
function normalizeRecord(record) {
  if (!record) return null;
  
  return {
    freeMessageLimit: record.free_message_limit || 5,
    freeCharacterLimit: record.free_character_limit || 10,
    freeCharacters: record.free_characters || [],
    freeCharacterNames: record.free_character_names || [],
    // New premium gating fields (JSONB)
    premiumRoundtableGates: (() => {
      try {
        const v = record.premium_roundtable_gates;
        if (v && typeof v === 'object') return v;
      } catch {}
      return { savingRequiresPremium: true, allowAllSpeak: false, strictRotation: false, followUpsMin: null, repliesPerRoundMin: null, promptTemplate: '' };
    })(),
    premiumStudyIds: (() => {
      try {
        const arr = record.premium_study_ids;
        if (Array.isArray(arr)) return arr;
      } catch {}
      return [];
    })(),
    lastUpdated: record.updated_at || new Date().toISOString()
  };
}

/**
 * Denormalize app settings to database format
 * @param {Object} settings The app settings object
 * @returns {Object} Database-formatted settings
 */
function denormalizeSettings(settings) {
  return {
    free_message_limit: settings.freeMessageLimit || 5,
    free_character_limit: settings.freeCharacterLimit || 10,
    free_characters: settings.freeCharacters || [],
    free_character_names: settings.freeCharacterNames || [],
    premium_roundtable_gates: {
      savingRequiresPremium: settings?.premiumRoundtableGates?.savingRequiresPremium !== false,
      allowAllSpeak: !!settings?.premiumRoundtableGates?.allowAllSpeak,
      strictRotation: !!settings?.premiumRoundtableGates?.strictRotation,
      followUpsMin: settings?.premiumRoundtableGates?.followUpsMin ?? null,
      repliesPerRoundMin: settings?.premiumRoundtableGates?.repliesPerRoundMin ?? null,
      promptTemplate: typeof settings?.premiumRoundtableGates?.promptTemplate === 'string' ? settings.premiumRoundtableGates.promptTemplate : '',
    },
    premium_study_ids: settings.premiumStudyIds || [],
    updated_at: new Date().toISOString()
  };
}

/**
 * Load settings from localStorage cache
 * @returns {Object|null} The cached settings or null if not found
 */
function loadFromCache(slug) {
  try {
    const key = getCacheKey(slug);

    // Prefer new per-org key
    let cached = localStorage.getItem(key);

    // Fallback to legacy global key for backward compatibility
    if (!cached) {
      cached = localStorage.getItem('accountTierSettings');
    }

    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error('[tierSettingsService] Error loading from cache:', err);
    return null;
  }
}

/**
 * Save settings to localStorage cache
 * @param {Object} settings The settings to cache
 */
function saveToCache(settings, slug) {
  try {
    const key = getCacheKey(slug);
    localStorage.setItem(key, JSON.stringify(settings));
    
    // Dispatch custom event for same-tab updates
    // (storage event only fires in other tabs)
    try {
      window.dispatchEvent(new Event('accountTierSettingsChanged'));
    } catch (e) {
      /* no-op - ignore errors in older browsers */
    }
  } catch (err) {
    console.error('[tierSettingsService] Error saving to cache:', err);
  }
}

/**
 * Get tier settings for the specified owner
 * @param {string} [ownerSlug] Optional owner slug, defaults to getOwnerSlug()
 * @returns {Promise<Object>} The tier settings
 */
export async function getSettings(ownerSlug) {
  const slug = ownerSlug || getOwnerSlug();
  
  try {
    // Try to get from Supabase first
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('owner_slug', slug)
      .maybeSingle();
    
    if (error) {
      console.error('[tierSettingsService] Supabase error:', error);
      // Fall back to cache on error (use correct org slug)
      return loadFromCache(slug) || getDefaultSettings();
    }
    
    if (data) {
      // Found in Supabase, normalize and update cache
      const settings = normalizeRecord(data);
      saveToCache(settings, slug);
      return settings;
    }
    
    // Not found in Supabase, try cache
    const cachedSettings = loadFromCache(slug);
    if (cachedSettings) {
      return cachedSettings;
    }
    
    // Nothing in cache either, return defaults
    return getDefaultSettings();
  } catch (err) {
    console.error('[tierSettingsService] Error fetching settings:', err);
    // Fall back to cache on any error
    return loadFromCache(slug) || getDefaultSettings();
  }
}

/**
 * Get default tier settings
 * @returns {Object} Default tier settings
 */
function getDefaultSettings() {
  return {
    freeMessageLimit: 5,
    freeCharacterLimit: 10,
    freeCharacters: [],
    freeCharacterNames: [],
    premiumRoundtableGates: { allowAllSpeak: false, strictRotation: false, followUpsMin: null, repliesPerRoundMin: null, promptTemplate: '' },
    premiumStudyIds: [],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Save tier settings
 * @param {Object} data The settings data to save
 * @param {string} [ownerSlug] Optional owner slug, defaults to getOwnerSlug()
 * @returns {Promise<boolean>} Success status
 */
export async function setSettings(data, ownerSlug) {
  const slug = ownerSlug || getOwnerSlug();
  
  try {
    // Prepare data for Supabase
    const dbData = {
      owner_slug: slug,
      ...denormalizeSettings(data)
    };
    
    // Upsert to Supabase (insert or update on conflict)
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(dbData, { 
        onConflict: 'owner_slug',
        returning: 'minimal' // Don't need the returned data
      });
    
    if (error) {
      console.error('[tierSettingsService] Error saving settings:', error);
      // Still update cache even if Supabase fails
      saveToCache(data, slug);
      return false;
    }
    
    // Update local cache
    saveToCache(data, slug);
    return true;
  } catch (err) {
    console.error('[tierSettingsService] Unexpected error saving settings:', err);
    // Still update cache even if Supabase fails
    saveToCache(data, slug);
    return false;
  }
}
