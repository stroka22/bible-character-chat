/**
 * Account Tier Utilities
 * 
 * Handles reading/writing account tier settings saved by the AccountTierManagement
 * component in localStorage. These settings control which characters are free vs premium
 * and message limits for free users.
 */

/**
 * Load account tier settings from localStorage
 * @returns {Object} Account tier settings with defaults if not found
 */
export function loadAccountTierSettings() {
  /* ------------------------------------------------------------------
   * Build defaults from environment variables so that admins can control
   * global “free” limits without touching localStorage on every client.
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
          .map((s) => parseIntSafe(s.trim()))
          .filter((n) => Number.isFinite(n))
      : [];

  // Final default baseline (env values > hard-coded fallbacks)
  const defaults = {
    freeMessageLimit: envFreeMsgLimit ?? 5,
    freeCharacterLimit: envFreeCharLimit ?? 10,
    freeCharacters: envFreeIds,
    lastUpdated: null,
  };

  // SSR safety check
  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const savedSettings = localStorage.getItem('accountTierSettings');
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
            .map((n) => parseIntSafe(n))
            .filter((n) => Number.isFinite(n))
        : defaults.freeCharacters;

    return {
      freeMessageLimit:
        parseIntSafe(parsed.freeMessageLimit) ?? defaults.freeMessageLimit,
      freeCharacterLimit:
        parseIntSafe(parsed.freeCharacterLimit) ?? defaults.freeCharacterLimit,
      freeCharacters: freeChars,
      lastUpdated: parsed.lastUpdated || defaults.lastUpdated,
    };
  } catch (error) {
    console.error('Failed to load account tier settings:', error);
    return defaults;
  }
}

/**
 * Check if a character is free (available to non-premium users)
 * @param {number|string} characterId - The character ID to check
 * @param {Object} [settings] - Optional settings object (loads from localStorage if not provided)
 * @returns {boolean} True if the character is free, false otherwise
 */
export function isCharacterFree(characterId, settings = null) {
  if (!characterId) return false;
  
  // Convert characterId to number for consistent comparison
  const id = typeof characterId === 'string' ? parseInt(characterId, 10) : characterId;
  if (isNaN(id)) return false;
  
  // Use provided settings or load from localStorage
  const tierSettings = settings || loadAccountTierSettings();
  
  // Defensive: ensure freeCharacters array consists of numbers
  const freeIds = Array.isArray(tierSettings.freeCharacters)
    ? tierSettings.freeCharacters
        .map((n) => (typeof n === 'string' ? parseInt(n, 10) : n))
        .filter((n) => Number.isFinite(n))
    : [];

  // Check if the character is in the free characters list
  return freeIds.includes(id);
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

  try {
    const updatedSettings = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('accountTierSettings', JSON.stringify(updatedSettings));
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
