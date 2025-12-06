import { supabase } from '../services/supabase';

/**
 * Default roundtable settings
 * Used as fallback when no settings are found in the database
 */
export const DEFAULT_ROUNDTABLE_SETTINGS = {
  defaults: {
    repliesPerRound: 3,
    followUpsPerRound: 2,
    maxWordsPerReply: 110,
    allowAllSpeak: false,
    strictRotation: false,
    creativity: 0.7,
    maxParticipants: 8,
    saveByDefault: true,
    enableAdvanceRound: true
  },
  /*
   * Per-tier limits.  “free” caps are slightly lower while “premium”
   * inherits the previous global limits (back-compat).
   */
  limits: {
    free: {
      repliesPerRound: { min: 1, max: 4 },
      followUpsPerRound: { min: 0, max: 2 },
      maxWordsPerReply: { min: 60, max: 140 },
      creativity: { min: 0.2, max: 0.9 },
      maxParticipants: 8
    },
    premium: {
      repliesPerRound: { min: 1, max: 6 },
      followUpsPerRound: { min: 0, max: 3 },
      maxWordsPerReply: { min: 60, max: 160 },
      creativity: { min: 0.2, max: 1.0 },
      maxParticipants: 12
    }
  },
  locks: {
    allowAllSpeak: false,
    strictRotation: false,
    enableAdvanceRound: false,
    saveByDefault: false
  }
};

/**
 * Repository for managing roundtable settings
 */
export const roundtableSettingsRepository = {
  /**
   * Get roundtable settings for a specific organization
   * @param {string} ownerSlug - Organization identifier
   * @returns {Promise<Object|null>} - Settings object or null if not found
   */
  async getByOwnerSlug(ownerSlug) {
    // Validate ownerSlug
    if (!ownerSlug) {
      console.warn('[roundtableSettingsRepository] Missing ownerSlug parameter');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('roundtable_settings')
        .select('*')
        .eq('owner_slug', ownerSlug)
        .maybeSingle();
      
      if (error) {
        console.error('[roundtableSettingsRepository] Error fetching settings:', error);
        // Return defaults rather than failing
        return DEFAULT_ROUNDTABLE_SETTINGS;
      }
      
      if (!data) {
        console.log(`[roundtableSettingsRepository] No settings found for ${ownerSlug}, using defaults`);
        return DEFAULT_ROUNDTABLE_SETTINGS;
      }
      
      // Merge with defaults to ensure all properties exist
      return {
        defaults: { ...DEFAULT_ROUNDTABLE_SETTINGS.defaults, ...data.defaults },
        limits: (() => {
          const defaultLimits = DEFAULT_ROUNDTABLE_SETTINGS.limits;
          const incoming = data.limits || {};

          // If incoming already has tier keys, merge tier-by-tier
          if (incoming.free || incoming.premium) {
            return {
              free: { ...defaultLimits.free, ...(incoming.free || {}) },
              premium: { ...defaultLimits.premium, ...(incoming.premium || {}) }
            };
          }

          // Otherwise treat incoming as flat limits applied to both tiers
          return {
            free: { ...defaultLimits.free, ...incoming },
            premium: { ...defaultLimits.premium, ...incoming }
          };
        })(),
        locks: { ...DEFAULT_ROUNDTABLE_SETTINGS.locks, ...data.locks }
      };
    } catch (err) {
      console.error('[roundtableSettingsRepository] Unexpected error fetching settings:', err);
      return DEFAULT_ROUNDTABLE_SETTINGS;
    }
  },

  /**
   * Update or insert roundtable settings for a specific organization
   * @param {string} ownerSlug - Organization identifier
   * @param {Object} payload - Settings payload to save
   * @returns {Promise<Object>} - The saved settings row
   */
  async upsertByOwnerSlug(ownerSlug, payload) {
    // Validate ownerSlug
    if (!ownerSlug) {
      throw new Error('Organization identifier (ownerSlug) is required');
    }

    // Validate payload
    if (!payload || typeof payload !== 'object') {
      throw new Error('Settings payload must be a valid object');
    }

    try {
      // Use serverless API with service-role enforcement to bypass RLS safely
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes?.session?.access_token || null;
      const resp = await fetch('/api/roundtable/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ owner_slug: ownerSlug, ...payload }),
      });
      if (!resp.ok) {
        let msg = 'Unknown error';
        try {
          const j = await resp.json();
          msg = j?.error || msg;
        } catch {}
        throw new Error(`Failed to save roundtable settings: ${msg}`);
      }
      const json = await resp.json();
      return json?.data || null;
    } catch (err) {
      console.error('[roundtableSettingsRepository] Unexpected error upserting settings (via API):', err);
      throw new Error(`Failed to save roundtable settings: ${err.message}`);
    }
  }
};

export default roundtableSettingsRepository;
