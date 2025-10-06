import { supabase } from '../services/supabase';

// Local fallback keys
const LS_FAVORITES_KEY = 'favoriteCharacters';

function readLocalIds() {
  try {
    const saved = localStorage.getItem(LS_FAVORITES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalIds(ids) {
  try {
    localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(ids || []));
  } catch {}
}

export const userFavoritesRepository = {
  async getFavoriteIds(userId) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('character_id')
        .eq('user_id', userId);
      if (error) throw error;
      const serverIds = (data || []).map((r) => r.character_id);
      // Also merge any local favorites to ensure continuity when offline or when
      // Supabase policies/tables are not yet provisioned. This helps My Walk
      // show favorites saved locally until server sync is available.
      let localIds = [];
      try { localIds = readLocalIds(); } catch {}
      return Array.from(new Set([...(serverIds || []), ...(localIds || [])]));
    } catch (err) {
      console.warn('[userFavoritesRepository] Falling back to localStorage for favorites:', err?.message);
      try {
        return readLocalIds();
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
        // Keep local cache in sync (idempotent add)
        const ids = readLocalIds();
        if (!ids.includes(characterId)) {
          ids.push(characterId);
          writeLocalIds(ids);
        }
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('character_id', characterId);
        if (error) throw error;
        // Remove from local cache as well
        let ids = readLocalIds();
        ids = ids.filter((id) => id !== characterId);
        writeLocalIds(ids);
      }
      return true;
    } catch (err) {
      console.warn('[userFavoritesRepository] setFavorite fallback to localStorage:', err?.message);
      try {
        let ids = readLocalIds();
        if (isFavorite && !ids.includes(characterId)) ids.push(characterId);
        if (!isFavorite) ids = ids.filter((id) => id !== characterId);
        writeLocalIds(ids);
        return true;
      } catch {
        return false;
      }
    }
  },
};

export default userFavoritesRepository;
