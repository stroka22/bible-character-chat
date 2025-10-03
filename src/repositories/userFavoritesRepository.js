import { supabase } from '../services/supabase';

// Local fallback keys
const LS_FAVORITES_KEY = 'favoriteCharacters';

export const userFavoritesRepository = {
  async getFavoriteIds(userId) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('character_id')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map((r) => r.character_id);
    } catch (err) {
      console.warn('[userFavoritesRepository] Falling back to localStorage for favorites:', err?.message);
      try {
        const saved = localStorage.getItem(LS_FAVORITES_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
  },

  async isFavorite(userId, characterId) {
    const ids = await this.getFavoriteIds(userId);
    return ids.includes(characterId);
  },

  async setFavorite(userId, characterId, isFavorite) {
    if (!userId || !characterId) return false;
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: userId, character_id: characterId })
          .select('user_id')
          .single();
        if (error && error.code !== '23505') { // ignore duplicate
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('character_id', characterId);
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.warn('[userFavoritesRepository] setFavorite fallback to localStorage:', err?.message);
      try {
        const saved = localStorage.getItem(LS_FAVORITES_KEY) || '[]';
        let ids = [];
        try { ids = JSON.parse(saved) || []; } catch { ids = []; }
        if (isFavorite && !ids.includes(characterId)) ids.push(characterId);
        if (!isFavorite) ids = ids.filter((id) => id !== characterId);
        localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(ids));
        return true;
      } catch {
        return false;
      }
    }
  },
};

export default userFavoritesRepository;
