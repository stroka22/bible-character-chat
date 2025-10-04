import { supabase } from '../services/supabase';

export const siteSettingsRepository = {
  async getDefaultFeaturedCharacterId(ownerSlug) {
    if (!ownerSlug) return null;
    try {
      // 1) Try direct Supabase first (fast path on desktop and most devices)
      const { data, error } = await supabase
        .from('site_settings')
        .select('default_featured_character_id')
        .eq('owner_slug', ownerSlug)
        .single();
      if (!error && data) return data?.default_featured_character_id || null;

      // 2) Fallback to same-origin proxy to bypass device CORS/privacy blockers
      try {
        const url = `/api/featured/site?ownerSlug=${encodeURIComponent(ownerSlug)}`;
        const resp = await fetch(url, { credentials: 'include', cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          if ('default_featured_character_id' in json) {
            return json.default_featured_character_id || null;
          }
        }
      } catch (_) { /* swallow and return null below */ }

      return null;
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
