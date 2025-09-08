import { supabase } from '../services/supabase';
import { getOwnerSlug } from '../services/tierSettingsService';

export const bibleStudiesRepository = {
  async listStudies({ ownerSlug, includePrivate = false } = {}) {
    try {
      const org = ownerSlug || getOwnerSlug();
      
      let query = supabase
        .from('bible_studies')
        .select('*')
        .eq('owner_slug', org)
        .order('created_at', { ascending: false });
      
      if (!includePrivate) {
        query = query.eq('visibility', 'public');
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[bibleStudiesRepository] Error listing studies:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error listing studies:', err);
      return [];
    }
  },
  
  async getStudyById(id) {
    try {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error fetching study:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error fetching study:', err);
      return null;
    }
  },
  
  async listLessons(studyId) {
    try {
      if (!studyId) return [];
      
      const { data, error } = await supabase
        .from('bible_study_lessons')
        .select('*')
        .eq('study_id', studyId)
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('[bibleStudiesRepository] Error listing lessons:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error listing lessons:', err);
      return [];
    }
  },
  
  async getLessonByIndex(studyId, index) {
    try {
      if (!studyId || index === undefined || index === null) return null;
      
      const { data, error } = await supabase
        .from('bible_study_lessons')
        .select('*')
        .eq('study_id', studyId)
        .eq('order_index', index)
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error fetching lesson:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error fetching lesson:', err);
      return null;
    }
  },
  
  async upsertStudy(study) {
    try {
      if (!study || typeof study !== 'object') {
        throw new Error('Study payload must be a valid object');
      }
      const payload = {
        ...study,
        owner_slug: study.owner_slug || getOwnerSlug(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('bible_studies')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error upserting study:', error);
        throw new Error(`Failed to save study: ${error.message}`);
      }
      
      return data;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error upserting study:', err);
      throw new Error(`Failed to save study: ${err.message}`);
    }
  },
  
  async upsertLesson(lesson) {
    try {
      if (!lesson || typeof lesson !== 'object') {
        throw new Error('Lesson payload must be a valid object');
      }
      
      if (!lesson.study_id) {
        throw new Error('Lesson must have a study_id');
      }

      const payload = {
        ...lesson,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('bible_study_lessons')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error upserting lesson:', error);
        throw new Error(`Failed to save lesson: ${error.message}`);
      }
      
      return data;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error upserting lesson:', err);
      throw new Error(`Failed to save lesson: ${err.message}`);
    }
  },
  
  async saveProgress({ userId, studyId, currentLessonIndex, completedLessons, notes }) {
    try {
      if (!userId || !studyId) {
        throw new Error('User ID and Study ID are required');
      }
      
      const payload = {
        user_id: userId,
        study_id: studyId,
        last_activity_at: new Date().toISOString()
      };
      
      if (currentLessonIndex !== undefined) {
        payload.current_lesson_index = currentLessonIndex;
      }
      
      if (completedLessons) {
        payload.completed_lessons = completedLessons;
      }
      
      if (notes) {
        payload.notes = notes;
      }
      
      const { data, error } = await supabase
        .from('user_study_progress')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error saving progress:', error);
        throw new Error(`Failed to save progress: ${error.message}`);
      }
      
      return data;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error saving progress:', err);
      throw new Error(`Failed to save progress: ${err.message}`);
    }
  },
  
  async getProgress({ userId, studyId }) {
    try {
      if (!userId || !studyId) return null;
      
      const { data, error } = await supabase
        .from('user_study_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('study_id', studyId)
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error fetching progress:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error fetching progress:', err);
      return null;
    }
  },

  /* ------------------------------------------------------------------
   * Admin helpers
   * ------------------------------------------------------------------ */
  /**
   * Permanently delete a Bible study (admin / superadmin only via RLS)
   * @param {string} id - bible_studies.id (uuid)
   * @returns {Promise<boolean>} true on success, false on failure
   */
  async deleteStudy(id) {
    try {
      if (!id) throw new Error('Study id required');

      const { error } = await supabase
        .from('bible_studies')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      console.error('[bibleStudiesRepository] Error deleting study:', err);
      return false;
    }
  },

  /**
   * Permanently delete a lesson (admin / superadmin only via RLS)
   * @param {string} id - bible_study_lessons.id (uuid)
   * @returns {Promise<boolean>} true on success, false on failure
   */
  async deleteLesson(id) {
    try {
      if (!id) throw new Error('Lesson id required');

      const { error } = await supabase
        .from('bible_study_lessons')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      console.error('[bibleStudiesRepository] Error deleting lesson:', err);
      return false;
    }
  }
};

export default bibleStudiesRepository;
