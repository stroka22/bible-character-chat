import { supabase } from '../services/supabase';

export const siteSettingsRepository = {
  async getDefaultFeaturedCharacterId(ownerSlug) {
    if (!ownerSlug) return null;
    try {
      // Try same-origin proxy first to avoid mobile CORS/privacy blockers
      try {
        // Prefer CommonJS variant which is known to work in our environment
        const urlJson = `/api/featured/site-json?ownerSlug=${encodeURIComponent(ownerSlug)}`;
        let resp = await fetch(urlJson, { credentials: 'include', cache: 'no-store' });
        if (!resp.ok) {
          // Fallback to ESM route if JSON route not available
          const url = `/api/featured/site?ownerSlug=${encodeURIComponent(ownerSlug)}`;
          resp = await fetch(url, { credentials: 'include', cache: 'no-store' });
        }
        if (resp.ok) {
          const json = await resp.json();
          if ('default_featured_character_id' in json) {
            return json.default_featured_character_id || null;
          }
        }
      } catch (_) { /* fall through to Supabase direct */ }

      const { data, error } = await supabase
        .from('site_settings')
        .select('default_featured_character_id')
        .eq('owner_slug', ownerSlug)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data?.default_featured_character_id || null;
    } catch (e) {
      console.warn('[siteSettingsRepository] getDefaultFeaturedCharacterId failed:', e?.message);
      return null;
    }
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
  }
};

export default siteSettingsRepository;
