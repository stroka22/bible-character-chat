/**
 * Account Tier Utilities
 * 
 * Handles reading/writing account tier settings saved by the AccountTierManagement
 * component in localStorage. These settings control which characters are free vs premium
 * and message limits for free users.
 */

// Import owner-slug helper to scope cache keys
import { getOwnerSlug } from '../services/tierSettingsService';

/**
 * Load account tier settings from localStorage
 * @returns {Object} Account tier settings with defaults if not found
 */

/**
 * Normalise any id (number, string, UUID) to a trimmed string so that
 * comparisons are type-agnostic.
 * @param {string|number} raw
 * @returns {string} normalised id
 */
const normalizeId = (raw) =>
  raw === undefined || raw === null ? '' : String(raw).trim();

/**
 * Normalize a character name for consistent comparison
 * @param {string} name 
 * @returns {string} lowercase trimmed name
 */
const normalizeName = (name) =>
  name === undefined || name === null ? '' : String(name).trim().toLowerCase();

/**
 * Build the per-organisation cache key so each org has isolated settings.
 * Kept here (duplicate of tierSettingsService) to avoid circular deps.
 * @param {string} slug
 */
const getCacheKey = (slug) => `accountTierSettings:${slug}`;

export function loadAccountTierSettings() {
  /* ------------------------------------------------------------------
   * Build defaults from environment variables so that admins can control
   * global "free" limits without touching localStorage on every client.
   * These env values are injected at build-time by Vite / Vercel.
   * ---------------------------------------------------------------- */
  // Grab Vite env object (safe during SSR and build)
  const env =
    typeof import.meta !== 'undefined' && import.meta && import.meta.env
      ? import.meta.env
      : {};

  const parseIntSafe = (val) => {
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : null;
  };

  const envFreeMsgLimit = parseIntSafe(env.VITE_FREE_MESSAGE_LIMIT);
  const envFreeCharLimit = parseIntSafe(env.VITE_FREE_CHARACTER_LIMIT);

  const envFreeIds =
    typeof env.VITE_FREE_CHARACTER_IDS === 'string'
      ? env.VITE_FREE_CHARACTER_IDS.split(',')
          .map((s) => normalizeId(s))
          .filter((id) => id !== '')
      : [];

  // Final default baseline (env values > hard-coded fallbacks)
  const defaults = {
    freeMessageLimit: envFreeMsgLimit ?? 5,
    freeCharacterLimit: envFreeCharLimit ?? 10,
    freeCharacters: envFreeIds,
    freeCharacterNames: [], // Default empty array for name-based fallback
    lastUpdated: null,
  };

  // SSR safety check
  if (typeof window === 'undefined') {
    return defaults;
  }

  // Determine which org we belong to (falls back to 'default')
  const ownerSlug = getOwnerSlug();

  try {
    // Prefer the scoped key; fallback to legacy global key for BC
    let savedSettings = localStorage.getItem(getCacheKey(ownerSlug));
    if (!savedSettings) {
      savedSettings = localStorage.getItem('accountTierSettings');
    }
    if (!savedSettings) {
      return defaults;
    }

    let parsed;
    try {
      parsed = JSON.parse(savedSettings);
    } catch (err) {
      console.error('Failed to parse accountTierSettings from localStorage:', err);
      return defaults;
    }

    // Ensure all required properties exist and fall back to defaults/env
    const freeChars =
      Array.isArray(parsed.freeCharacters) && parsed.freeCharacters.length > 0
        ? parsed.freeCharacters
            .map((id) => normalizeId(id))
            .filter((id) => id !== '')
        : defaults.freeCharacters;
    
    // Process free character names (new)
    const freeNames =
      Array.isArray(parsed.freeCharacterNames) && parsed.freeCharacterNames.length > 0
        ? parsed.freeCharacterNames
            .map((name) => normalizeName(name))
            .filter((name) => name !== '')
        : defaults.freeCharacterNames;

    return {
      freeMessageLimit:
        parseIntSafe(parsed.freeMessageLimit) ?? defaults.freeMessageLimit,
      freeCharacterLimit:
        parseIntSafe(parsed.freeCharacterLimit) ?? defaults.freeCharacterLimit,
      freeCharacters: freeChars,
      freeCharacterNames: freeNames,
      lastUpdated: parsed.lastUpdated || defaults.lastUpdated,
    };
  } catch (error) {
    console.error('Failed to load account tier settings:', error);
    return defaults;
  }
}

/**
 * Check if a character is free (available to non-premium users)
 * @param {number|string|Object} characterIdOrObject - The character ID or character object to check
 * @param {Object} [settings] - Optional settings object (loads from localStorage if not provided)
 * @returns {boolean} True if the character is free, false otherwise
 */
export function isCharacterFree(characterIdOrObject, settings = null) {
  // Use provided settings or load from localStorage
  const tierSettings = settings || loadAccountTierSettings();

  // Handle case where input is a character object
  if (characterIdOrObject && typeof characterIdOrObject === 'object') {
    const character = characterIdOrObject;
    
    // Try by ID first if available
    if (character.id !== undefined && character.id !== null) {
      const idStr = normalizeId(character.id);
      const freeIds = Array.isArray(tierSettings.freeCharacters)
        ? tierSettings.freeCharacters.map((v) => normalizeId(v))
        : [];
      
      if (freeIds.includes(idStr)) {
        return true;
      }
    }
    
    // Fall back to name check
    if (character.name) {
      const normalizedName = normalizeName(character.name);
      const freeNames = Array.isArray(tierSettings.freeCharacterNames)
        ? tierSettings.freeCharacterNames
        : [];
      
      return freeNames.includes(normalizedName);
    }
    
    return false;
  }
  
  // Handle case where input is just an ID (original behavior)
  const idStr = normalizeId(characterIdOrObject);
  if (!idStr) return false;

  // Build a normalised array of free character IDs
  const freeIds = Array.isArray(tierSettings.freeCharacters)
    ? tierSettings.freeCharacters.map((v) => normalizeId(v))
    : [];

  return freeIds.includes(idStr);
}

/**
 * Save account tier settings to localStorage
 * @param {Object} settings - The settings to save
 * @returns {boolean} True if saved successfully, false otherwise
 */
export function saveAccountTierSettings(settings) {
  // SSR safety check
  if (typeof window === 'undefined') {
    return false;
  }

  const ownerSlug = getOwnerSlug();

  try {
    const updatedSettings = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };

    // Write to per-org key
    localStorage.setItem(
      getCacheKey(ownerSlug),
      JSON.stringify(updatedSettings),
    );

    /* Notify listeners in the same tab (AccountTierManagement dispatches
       the same event; we mirror that for callers using this util). */
    try {
      window.dispatchEvent(new Event('accountTierSettingsChanged'));
    } catch (_) {
      /* ignore older browsers */
    }
    return true;
  } catch (error) {
    console.error('Failed to save account tier settings:', error);
    return false;
  }
}

/**
 * Check if a user has reached their free message limit
 * @param {number} messageCount - Current message count in the conversation
 * @param {Object} [settings] - Optional settings object (loads from localStorage if not provided)
 * @returns {boolean} True if the user has reached their limit, false otherwise
 */
export function hasReachedMessageLimit(messageCount, settings = null) {
  const tierSettings = settings || loadAccountTierSettings();
  return messageCount >= tierSettings.freeMessageLimit;
}
