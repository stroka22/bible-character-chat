import { supabase } from '../services/supabase';
import { getOwnerSlug } from '../services/tierSettingsService';

export const bibleSeriesRepository = {
  async listSeries({ ownerSlug, includePrivate = false, showInNavOnly = false } = {}) {
    try {
      const org = ownerSlug || getOwnerSlug();
      let query = supabase
        .from('bible_study_series')
        .select('*')
        .eq('owner_slug', org)
        .order('created_at', { ascending: false });

      if (!includePrivate) {
        query = query.neq('visibility', 'private');
      }
      if (showInNavOnly) {
        query = query.eq('show_in_nav', true);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[bibleSeriesRepository] listSeries error:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('[bibleSeriesRepository] listSeries unexpected:', err);
      return [];
    }
  },

  async getBySlug(slug, { ownerSlug } = {}) {
    try {
      const org = ownerSlug || getOwnerSlug();
      const { data, error } = await supabase
        .from('bible_study_series')
        .select('*')
        .eq('owner_slug', org)
        .eq('slug', slug)
        .maybeSingle();
      if (error) {
        console.error('[bibleSeriesRepository] getBySlug error:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('[bibleSeriesRepository] getBySlug unexpected:', err);
      return null;
    }
  },

  async listItemsWithStudies(seriesId) {
    try {
      if (!seriesId) return [];
      const { data, error } = await supabase
        .from('bible_study_series_items')
        .select('id, series_id, study_id, order_index, override_title, study:bible_studies(id, title, description, is_premium, cover_image_url)')
        .eq('series_id', seriesId)
        .order('order_index', { ascending: true });
      if (error) {
        console.error('[bibleSeriesRepository] listItemsWithStudies error:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('[bibleSeriesRepository] listItemsWithStudies unexpected:', err);
      return [];
    }
  },

  async upsertSeries(series) {
    try {
      if (!series || typeof series !== 'object') throw new Error('Series payload required');
      const payload = {
        ...series,
        owner_slug: series.owner_slug || getOwnerSlug(),
        updated_at: new Date().toISOString(),
      };
      if (!payload.id) delete payload.id; // allow default uuid
      const { data, error } = await supabase
        .from('bible_study_series')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      console.error('[bibleSeriesRepository] upsertSeries error:', err);
      throw err;
    }
  },

  async deleteSeries(id) {
    try {
      if (!id) throw new Error('Series id required');
      const { error } = await supabase
        .from('bible_study_series')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      console.error('[bibleSeriesRepository] deleteSeries error:', err);
      return false;
    }
  },

  async upsertItem(item) {
    try {
      if (!item || typeof item !== 'object') throw new Error('Series item payload required');
      if (!item.series_id) throw new Error('series_id required');
      if (!item.study_id) throw new Error('study_id required');
      const payload = { ...item, updated_at: new Date().toISOString() };
      if (!payload.id) delete payload.id;
      const { data, error } = await supabase
        .from('bible_study_series_items')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      console.error('[bibleSeriesRepository] upsertItem error:', err);
      throw err;
    }
  },

  async deleteItem(id) {
    try {
      if (!id) throw new Error('Item id required');
      const { error } = await supabase
        .from('bible_study_series_items')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      console.error('[bibleSeriesRepository] deleteItem error:', err);
      return false;
    }
  },

  async getProgress({ userId, seriesId }) {
    try {
      if (!userId || !seriesId) return null;
      const { data, error } = await supabase
        .from('user_series_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('series_id', seriesId)
        .maybeSingle();
      if (error) return null;
      return data;
    } catch (err) {
      console.error('[bibleSeriesRepository] getProgress unexpected:', err);
      return null;
    }
  },

  async saveProgress({ userId, seriesId, currentIndex, completedItems }) {
    try {
      if (!userId || !seriesId) throw new Error('userId and seriesId required');
      const payload = {
        user_id: userId,
        series_id: seriesId,
        current_index: currentIndex ?? 0,
        last_activity_at: new Date().toISOString(),
      };
      if (completedItems) payload.completed_items = completedItems;
      const { data, error } = await supabase
        .from('user_series_progress')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      console.error('[bibleSeriesRepository] saveProgress error:', err);
      throw err;
    }
  }
};

export default bibleSeriesRepository;
