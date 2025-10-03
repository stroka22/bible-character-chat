import { supabase } from '../services/supabase';

const LS_FEATURED_KEY = 'featuredCharacter';

export const userSettingsRepository = {
  async getFeaturedCharacterId(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('featured_character_id')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // ignore not-found
      return data?.featured_character_id || null;
    } catch (err) {
      console.warn('[userSettingsRepository] Falling back to localStorage for featured:', err?.message);
      try {
        const name = localStorage.getItem(LS_FEATURED_KEY);
        // We only stored a name historically; return null to avoid mismatch.
        return null;
      } catch {
        return null;
      }
    }
  },

  async setFeaturedCharacterId(userId, characterId) {
    if (!userId) return false;
    try {
      // Upsert user_settings row
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, featured_character_id: characterId }, { onConflict: 'user_id' });
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('[userSettingsRepository] setFeatured fallback to localStorage:', err?.message);
      try {
        // best-effort: store name still for legacy UI, though we prefer IDs now
        localStorage.setItem(LS_FEATURED_KEY, String(characterId));
        return true;
      } catch {
        return false;
      }
    }
  }
};

export default userSettingsRepository;
