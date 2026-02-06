import { supabase } from '../services/supabase';

export const siteSettingsRepository = {
  async getSettings(ownerSlug) {
    if (!ownerSlug) return null;
    try {
      // 1) Try direct Supabase first (fast path on desktop and most devices)
      // Use maybeSingle() so missing rows don't trigger 406 Not Acceptable
      {
        const { data, error } = await supabase
          .from('site_settings')
          .select('default_featured_character_id,enforce_admin_default,logo_url,primary_color,welcome_message,display_name,tagline')
          .eq('owner_slug', ownerSlug)
          .maybeSingle();
        if (!error && data) {
          return {
            defaultId: data?.default_featured_character_id || null,
            enforceAdminDefault: !!data?.enforce_admin_default,
            logoUrl: data?.logo_url || null,
            primaryColor: data?.primary_color || null,
            welcomeMessage: data?.welcome_message || null,
            displayName: data?.display_name || null,
            tagline: data?.tagline || null,
          };
        }
        // If new columns don't exist yet, fall back to selecting only the featured character fields
        if (error) {
          const fallback = await supabase
            .from('site_settings')
            .select('default_featured_character_id,enforce_admin_default')
            .eq('owner_slug', ownerSlug)
            .maybeSingle();
          if (!fallback.error && fallback.data) {
            return { 
              defaultId: fallback.data?.default_featured_character_id || null, 
              enforceAdminDefault: !!fallback.data?.enforce_admin_default,
              logoUrl: null,
              primaryColor: null,
              welcomeMessage: null,
              displayName: null,
              tagline: null,
            };
          }
        }
      }

      // 2) Fallback to same-origin proxy to bypass device CORS/privacy blockers
      try {
        const url = `/api/featured/site?ownerSlug=${encodeURIComponent(ownerSlug)}`;
        const resp = await fetch(url, { credentials: 'include', cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          if ('default_featured_character_id' in json) {
            return {
              defaultId: json.default_featured_character_id || null,
              enforceAdminDefault: !!json.enforce_admin_default,
              logoUrl: json.logo_url || null,
              primaryColor: json.primary_color || null,
              welcomeMessage: json.welcome_message || null,
              displayName: json.display_name || null,
              tagline: json.tagline || null,
            };
          }
        }
      } catch (_) { /* swallow and return null below */ }

      return { defaultId: null, enforceAdminDefault: false, logoUrl: null, primaryColor: null, welcomeMessage: null, displayName: null, tagline: null };
    } catch (e) {
      console.warn('[siteSettingsRepository] getDefaultFeaturedCharacterId failed:', e?.message);
      return { defaultId: null, enforceAdminDefault: false, logoUrl: null, primaryColor: null, welcomeMessage: null, displayName: null, tagline: null };
    }
  },

  async getDefaultFeaturedCharacterId(ownerSlug) {
    const settings = await this.getSettings(ownerSlug);
    return settings?.defaultId || null;
  },

  async setDefaultFeaturedCharacterId(ownerSlug, characterId) {
    if (!ownerSlug) throw new Error('ownerSlug required');
    try {
      const payload = {
        owner_slug: ownerSlug,
        default_featured_character_id: characterId || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'owner_slug' });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('[siteSettingsRepository] setDefaultFeaturedCharacterId failed:', e);
      throw e;
    }
  },

  /**
   * Update branding settings for an organization
   * @param {string} ownerSlug - Organization slug
   * @param {object} branding - Branding fields to update
   * @param {string} [branding.logoUrl] - URL to organization logo
   * @param {string} [branding.primaryColor] - Hex color code (e.g., '#D97706')
   * @param {string} [branding.welcomeMessage] - Welcome message for home page
   * @param {string} [branding.displayName] - Organization display name
   * @param {string} [branding.tagline] - Organization tagline
   */
  async updateBranding(ownerSlug, branding) {
    if (!ownerSlug) throw new Error('ownerSlug required');
    try {
      const payload = {
        owner_slug: ownerSlug,
        updated_at: new Date().toISOString(),
      };
      
      if (branding.logoUrl !== undefined) payload.logo_url = branding.logoUrl;
      if (branding.primaryColor !== undefined) payload.primary_color = branding.primaryColor;
      if (branding.welcomeMessage !== undefined) payload.welcome_message = branding.welcomeMessage;
      if (branding.displayName !== undefined) payload.display_name = branding.displayName;
      if (branding.tagline !== undefined) payload.tagline = branding.tagline;
      
      const { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'owner_slug' });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('[siteSettingsRepository] updateBranding failed:', e);
      throw e;
    }
  },

  /**
   * Get all settings for an organization (alias for getSettings)
   */
  async getAllSettings(ownerSlug) {
    return this.getSettings(ownerSlug);
  }
};

export default siteSettingsRepository;
