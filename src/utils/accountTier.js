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
   * Build env-driven defaults so they work even when localStorage
   * hasn’t been initialised (for new visitors / other browsers).
   * ---------------------------------------------------------------- */
  const env = typeof import.meta !== 'undefined' ? import.meta.env : {};

  const envFreeMessageLimit = Number.parseInt(env?.VITE_FREE_MESSAGE_LIMIT, 10);
  const envFreeCharacterLimit = Number.parseInt(env?.VITE_FREE_CHARACTER_LIMIT, 10);

  // Parse comma-separated IDs -> [Number]
  const envFreeIds = (env?.VITE_FREE_CHARACTER_IDS || '')
    .split(',')
    .map((id) => Number.parseInt(id.trim(), 10))
    .filter((n) => !Number.isNaN(n));

  // Default settings (env values win, otherwise hard-coded fallbacks)
  const defaults = {
    freeMessageLimit: Number.isFinite(envFreeMessageLimit) ? envFreeMessageLimit : 5,
    freeCharacterLimit: Number.isFinite(envFreeCharacterLimit) ? envFreeCharacterLimit : 10,
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

    let settings;
    try {
      settings = JSON.parse(savedSettings);
    } catch (e) {
      console.error('Failed to parse accountTierSettings:', e);
      return defaults;
    }

    const hasAuthoritativeUpdate = Boolean(settings.lastUpdated);

    // Merge with env defaults – env acts as baseline, saved settings override when valid.
    return {
      freeMessageLimit:
        settings.freeMessageLimit || defaults.freeMessageLimit,
      freeCharacterLimit:
        settings.freeCharacterLimit || defaults.freeCharacterLimit,
      freeCharacters:
        Array.isArray(settings.freeCharacters) && settings.freeCharacters.length > 0
          ? settings.freeCharacters
          : defaults.freeCharacters,
      lastUpdated: hasAuthoritativeUpdate ? settings.lastUpdated : null,
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
  
  // Defensive: ensure freeCharacters is an array of numbers
  const freeIds = Array.isArray(tierSettings.freeCharacters)
    ? tierSettings.freeCharacters.map((n) => Number.parseInt(n, 10)).filter((n) => !Number.isNaN(n))
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
