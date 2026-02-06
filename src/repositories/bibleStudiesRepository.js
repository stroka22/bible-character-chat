import { supabase } from '../services/supabase';
import { getOwnerSlug } from '../services/tierSettingsService';

export const bibleStudiesRepository = {
  async listStudies({ ownerSlug, includePrivate = false, allOwners = false, includeHidden = false } = {}) {
    try {
      const org = (ownerSlug || getOwnerSlug() || '').trim();
      const wantAll = allOwners || org === '__ALL__' || org === '*';
      
      let query = supabase
        .from('bible_studies')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (!wantAll) {
        query = query.eq('owner_slug', org.toLowerCase());
      }
      
      if (!includePrivate) {
        query = query.eq('visibility', 'public');
      }
      
      // Filter out hidden studies unless admin is viewing
      if (!includeHidden) {
        query = query.neq('is_visible', false);
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

      // Allow DB default (generated uuid) when creating a new row
      if (!payload.id) {
        delete payload.id;
      }

      let { data, error } = await supabase
        .from('bible_studies')
        .upsert(payload)
        .select('*')
        .maybeSingle();

      // Handle fresh-migration cache lag: if PostgREST hasn't picked up
      // the new column yet, retry without study_type (DB default applies).
      if (error) {
        const msg = String(error.message || '').toLowerCase();
        const details = String(error.details || '').toLowerCase();
        const hint = String(error.hint || '').toLowerCase();
        const text = `${msg} ${details} ${hint}`;
        const looksLikeCacheLag =
          text.includes("schema cache") ||
          (text.includes('column') && text.includes('study_type')) ||
          text.includes('could not find') && text.includes('study_type');

        if (looksLikeCacheLag && 'study_type' in payload) {
          // Remove field and retry so users can proceed immediately.
          // The DB default of 'standalone' will be used server-side.
          const { study_type, ...withoutType } = payload;
          ({ data, error } = await supabase
            .from('bible_studies')
            .upsert(withoutType)
            .select('*')
            .maybeSingle());
        }
      }

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

      // Normalize basic fields
      const now = new Date().toISOString();
      const desiredIndex = Number.isFinite(lesson.order_index) ? Number(lesson.order_index) : 0;
      const isUpdate = !!lesson.id;

      const basePayload = {
        title: lesson.title || '',
        scripture_refs: Array.isArray(lesson.scripture_refs) ? lesson.scripture_refs : [],
        summary: lesson.summary || '',
        prompts: Array.isArray(lesson.prompts) ? lesson.prompts : [],
        character_id: (lesson.character_id && lesson.character_id.trim()) ? lesson.character_id.trim() : null,
        updated_at: now,
      };

      // Helper to shift a block of lessons one step up or down to make room
      const shiftRange = async ({ studyId, start, end, direction }) => {
        // direction: 'up' means order_index+1, process in DESC to avoid collisions
        // direction: 'down' means order_index-1, process in ASC
        const ascending = direction === 'down';
        const rangeFilter = (q) => {
          q = q.eq('study_id', studyId);
          if (start !== undefined && start !== null) q = q.gte('order_index', start);
          if (end !== undefined && end !== null) q = q.lte('order_index', end);
          return q;
        };
        let { data: rows, error: selErr } = await rangeFilter(
          supabase.from('bible_study_lessons')
            .select('id, order_index')
            .order('order_index', { ascending })
        );
        if (selErr) throw new Error(selErr.message);
        for (const row of rows || []) {
          const nextIndex = direction === 'up' ? row.order_index + 1 : row.order_index - 1;
          const { error: updErr } = await supabase
            .from('bible_study_lessons')
            .update({ order_index: nextIndex, updated_at: now })
            .eq('id', row.id);
          if (updErr) throw new Error(updErr.message);
        }
      };

      if (isUpdate) {
        // Fetch current row to know old index
        const { data: current, error: curErr } = await supabase
          .from('bible_study_lessons')
          .select('id, study_id, order_index')
          .eq('id', lesson.id)
          .maybeSingle();
        if (curErr) throw new Error(curErr.message);
        if (!current) throw new Error('Lesson not found');

        const oldIndex = Number(current.order_index) || 0;
        const studyId = current.study_id;

        if (desiredIndex !== oldIndex) {
          if (desiredIndex < oldIndex) {
            // Move up: shift [desiredIndex .. oldIndex-1] up by +1
            await shiftRange({ studyId, start: desiredIndex, end: oldIndex - 1, direction: 'up' });
          } else {
            // Move down: shift [oldIndex+1 .. desiredIndex] down by -1
            await shiftRange({ studyId, start: oldIndex + 1, end: desiredIndex, direction: 'down' });
          }
        }

        const updatePayload = { ...basePayload, order_index: desiredIndex };
        const { data, error } = await supabase
          .from('bible_study_lessons')
          .update(updatePayload)
          .eq('id', lesson.id)
          .select('*')
          .maybeSingle();
        if (error) throw new Error(error.message);
        return data;
      } else {
        // Create new lesson: make room at desiredIndex by shifting >= desiredIndex up by +1
        await shiftRange({ studyId: lesson.study_id, start: desiredIndex, end: null, direction: 'up' });

        const insertPayload = {
          study_id: lesson.study_id,
          order_index: desiredIndex,
          ...basePayload,
          created_at: now,
        };
        const { data, error } = await supabase
          .from('bible_study_lessons')
          .insert(insertPayload)
          .select('*')
          .maybeSingle();
        if (error) throw new Error(error.message);
        return data;
      }
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error upserting lesson:', err);
      throw new Error(`Failed to save lesson: ${err.message}`);
    }
  },
  
  async saveProgress({ userId, studyId, progressId, currentLessonIndex, completedLessons, notes, label, createNew = false }) {
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
      
      if (label !== undefined) {
        payload.label = label;
      }
      
      let data, error;
      
      console.log('[bibleStudiesRepository] saveProgress called with:', { userId, studyId, progressId, createNew });
      
      // If we have a progressId, update that specific record
      if (progressId) {
        console.log('[bibleStudiesRepository] Updating existing record:', progressId);
        ({ data, error } = await supabase
          .from('user_study_progress')
          .update(payload)
          .eq('id', progressId)
          .select('*')
          .maybeSingle());
      } else if (createNew) {
        // Explicitly create new progress record (for "Start Again" feature)
        console.log('[bibleStudiesRepository] Creating NEW record (createNew=true)');
        ({ data, error } = await supabase
          .from('user_study_progress')
          .insert(payload)
          .select('*')
          .maybeSingle());
      } else {
        // Default behavior: find existing record or create one
        // First check if there's an existing progress record for this user/study
        console.log('[bibleStudiesRepository] No progressId - looking for existing record');
        const { data: existing } = await supabase
          .from('user_study_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('study_id', studyId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        console.log('[bibleStudiesRepository] Existing record found:', existing);
        
        if (existing?.id) {
          // Update existing record
          console.log('[bibleStudiesRepository] Updating found record:', existing.id);
          ({ data, error } = await supabase
            .from('user_study_progress')
            .update(payload)
            .eq('id', existing.id)
            .select('*')
            .maybeSingle());
        } else {
          // No existing record, create new
          console.log('[bibleStudiesRepository] No existing record - creating new');
          ({ data, error } = await supabase
            .from('user_study_progress')
            .insert(payload)
            .select('*')
            .maybeSingle());
        }
      }
      
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
  
  async deleteProgress(progressId) {
    try {
      if (!progressId) throw new Error('Progress ID required');
      
      // First, get all chats linked to this progress
      const { data: linkedChats } = await supabase
        .from('chats')
        .select('id')
        .eq('progress_id', progressId);
      
      // Delete messages and chats linked to this progress
      if (linkedChats && linkedChats.length > 0) {
        const chatIds = linkedChats.map(c => c.id);
        
        // Delete messages first
        await supabase
          .from('chat_messages')
          .delete()
          .in('chat_id', chatIds);
        
        // Delete the chats
        await supabase
          .from('chats')
          .delete()
          .in('id', chatIds);
      }
      
      // Now delete the progress record
      const { error } = await supabase
        .from('user_study_progress')
        .delete()
        .eq('id', progressId);
      
      if (error) {
        console.error('[bibleStudiesRepository] Error deleting progress:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error deleting progress:', err);
      return false;
    }
  },
  
  async updateProgressLabel(progressId, label) {
    try {
      if (!progressId) throw new Error('Progress ID required');
      
      const { data, error } = await supabase
        .from('user_study_progress')
        .update({ label })
        .eq('id', progressId)
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error updating label:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error updating label:', err);
      return null;
    }
  },
  
  async getProgress({ userId, studyId, progressId }) {
    try {
      if (!userId || !studyId) return null;
      
      let query = supabase
        .from('user_study_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('study_id', studyId);
      
      // If progressId specified, get that specific record
      if (progressId) {
        query = query.eq('id', progressId);
      }
      
      // Get most recent progress record
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
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

  /**
   * Get all studies that a user has started (has progress records)
   * Returns study info along with progress data
   */
  async getUserStudiesWithProgress(userId) {
    try {
      if (!userId) {
        console.log('[bibleStudiesRepository] No userId provided');
        return [];
      }
      
      console.log('[bibleStudiesRepository] Fetching progress for user:', userId);
      
      // Get all progress records for this user
      const { data: progressRecords, error: progressError } = await supabase
        .from('user_study_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity_at', { ascending: false });
      
      if (progressError) {
        console.error('[bibleStudiesRepository] Error fetching user progress:', progressError);
        return [];
      }
      
      console.log('[bibleStudiesRepository] Progress records found:', progressRecords?.length || 0);
      
      if (!progressRecords || progressRecords.length === 0) return [];
      
      // Get the study details for each progress record
      const studyIds = progressRecords.map(p => p.study_id);
      console.log('[bibleStudiesRepository] Fetching studies for IDs:', studyIds);
      
      const { data: studies, error: studiesError } = await supabase
        .from('bible_studies')
        .select('id, title, description, character_id, is_premium')
        .in('id', studyIds);
      
      if (studiesError) {
        console.error('[bibleStudiesRepository] Error fetching studies:', studiesError.message || studiesError);
        return [];
      }
      
      console.log('[bibleStudiesRepository] Studies found:', studies?.length || 0);
      
      // Get lesson counts for each study
      const { data: lessonCounts, error: lessonsError } = await supabase
        .from('bible_study_lessons')
        .select('study_id')
        .in('study_id', studyIds);
      
      const countMap = {};
      if (!lessonsError && lessonCounts) {
        for (const lc of lessonCounts) {
          countMap[lc.study_id] = (countMap[lc.study_id] || 0) + 1;
        }
      }
      
      // Combine progress with study info
      const studyMap = {};
      for (const s of (studies || [])) {
        studyMap[s.id] = s;
      }
      
      const result = progressRecords.map(progress => {
        const study = studyMap[progress.study_id];
        if (!study) return null;
        return {
          ...study,
          progressId: progress.id,
          progress: {
            id: progress.id,
            completed_lessons: progress.completed_lessons || [],
            current_lesson_index: progress.current_lesson_index || 0,
            last_activity_at: progress.last_activity_at,
            notes: progress.notes,
            label: progress.label || null,
            participants: progress.participants || [],
            created_at: progress.created_at,
          },
          lesson_count: countMap[progress.study_id] || 0,
        };
      }).filter(Boolean);
      
      console.log('[bibleStudiesRepository] Returning studies with progress:', result.length, result.map(r => ({ id: r.id, progressId: r.progressId, title: r.title })));
      return result;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error fetching user studies:', err);
      return [];
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

/**
 * Clone a study (and optionally its lessons) to one or more target organizations.
 * - If a study with the same title exists in a target org, append a numeric suffix "-2", "-3", ...
 * - Returns a summary per target org with new study IDs or errors.
 * @param {string} studyId
 * @param {string[]} targetOwnerSlugs list of target organizations
 * @param {{ includeLessons?: boolean }} options
 */
export async function cloneStudyToOwners(studyId, targetOwnerSlugs, options = {}) {
  const includeLessons = options.includeLessons !== false; // default true
  const results = [];
  try {
    if (!studyId) throw new Error('studyId required');
    if (!Array.isArray(targetOwnerSlugs) || targetOwnerSlugs.length === 0) {
      throw new Error('targetOwnerSlugs must be a non-empty array');
    }

    // Load source study and lessons
    const { data: srcStudy, error: sErr } = await supabase
      .from('bible_studies')
      .select('*')
      .eq('id', studyId)
      .maybeSingle();
    if (sErr) throw new Error(sErr.message);
    if (!srcStudy) throw new Error('Source study not found');

    let srcLessons = [];
    if (includeLessons) {
      const { data: ls, error: lErr } = await supabase
        .from('bible_study_lessons')
        .select('*')
        .eq('study_id', studyId)
        .order('order_index', { ascending: true });
      if (lErr) throw new Error(lErr.message);
      srcLessons = Array.isArray(ls) ? ls : [];
    }

    const titleBase = String(srcStudy.title || '').trim();

    // Helper: find an available title in target org by appending -N if needed
    const findAvailableTitle = async (owner) => {
      const MAX_TRIES = 50;
      for (let i = 0; i < MAX_TRIES; i++) {
        const candidate = i === 0 ? titleBase : `${titleBase}-${i + 1}`; // -2, -3, ...
        const { data, error } = await supabase
          .from('bible_studies')
          .select('id')
          .eq('owner_slug', owner)
          .eq('title', candidate)
          .limit(1);
        if (error) throw new Error(error.message);
        if (!data || data.length === 0) return candidate;
      }
      // Fallback if somehow all attempts taken
      const ts = Date.now();
      return `${titleBase}-${ts}`;
    };

    for (const rawOwner of targetOwnerSlugs) {
      const owner = String(rawOwner || '').trim().toLowerCase();
      if (!owner) {
        results.push({ owner, ok: false, error: 'Invalid owner slug' });
        continue;
      }
      try {
        const newTitle = await findAvailableTitle(owner);
        const now = new Date().toISOString();
        const insertStudy = {
          owner_slug: owner,
          title: newTitle,
          description: srcStudy.description || '',
          subject: srcStudy.subject || '',
          character_instructions: srcStudy.character_instructions || '',
          character_id: srcStudy.character_id || null,
          cover_image_url: srcStudy.cover_image_url || null,
          study_type: srcStudy.study_type || 'standalone',
          visibility: srcStudy.visibility || 'public',
          is_premium: !!srcStudy.is_premium,
          created_at: now,
          updated_at: now,
        };

        const { data: newStudy, error: insErr } = await supabase
          .from('bible_studies')
          .insert(insertStudy)
          .select('*')
          .maybeSingle();
        if (insErr) throw new Error(insErr.message);
        if (!newStudy?.id) throw new Error('Failed to create study');

        // Copy lessons if requested
        if (includeLessons && srcLessons.length) {
          for (const lesson of srcLessons) {
            const payload = {
              study_id: newStudy.id,
              order_index: Number(lesson.order_index) || 0,
              title: lesson.title || '',
              scripture_refs: Array.isArray(lesson.scripture_refs) ? lesson.scripture_refs : [],
              summary: lesson.summary || '',
              prompts: Array.isArray(lesson.prompts) ? lesson.prompts : [],
              character_id: lesson.character_id || null,
              created_at: now,
              updated_at: now,
            };
            const { error: lInsErr } = await supabase
              .from('bible_study_lessons')
              .insert(payload);
            if (lInsErr) throw new Error(lInsErr.message);
          }
        }

        results.push({ owner, ok: true, newStudyId: newStudy.id, title: newTitle });
      } catch (e) {
        results.push({ owner, ok: false, error: e?.message || String(e) });
      }
    }

    return { ok: true, results };
  } catch (err) {
    return { ok: false, error: err?.message || String(err), results };
  }
}

// ============================================
// ADMIN: Category Management for Bible Studies
// ============================================

export const bibleStudyCategoriesRepository = {
  async getCategories() {
    const { data, error } = await supabase
      .from('bible_study_categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('[bibleStudyCategoriesRepository] Error fetching categories:', error);
      return [];
    }
    return data || [];
  },

  async createCategory(category) {
    const { data, error } = await supabase
      .from('bible_study_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('bible_study_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('bible_study_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  async updateCategoryOrder(categories) {
    // Update display_order for multiple categories
    for (let i = 0; i < categories.length; i++) {
      const { error } = await supabase
        .from('bible_study_categories')
        .update({ display_order: i })
        .eq('id', categories[i].id);
      
      if (error) throw error;
    }
    return true;
  }
};

// ============================================
// ADMIN: Study visibility, featured, category, ordering
// ============================================

export const bibleStudiesAdminRepository = {
  async toggleFeatured(studyId, isFeatured) {
    const { data, error } = await supabase
      .from('bible_studies')
      .update({ is_featured: isFeatured })
      .eq('id', studyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async toggleVisible(studyId, isVisible) {
    const { data, error } = await supabase
      .from('bible_studies')
      .update({ is_visible: isVisible })
      .eq('id', studyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStudyCategory(studyId, category) {
    const { data, error } = await supabase
      .from('bible_studies')
      .update({ category })
      .eq('id', studyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateDisplayOrder(studyId, displayOrder) {
    const { data, error } = await supabase
      .from('bible_studies')
      .update({ display_order: displayOrder })
      .eq('id', studyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStudiesOrder(studies) {
    // Update display_order for multiple studies
    for (let i = 0; i < studies.length; i++) {
      const { error } = await supabase
        .from('bible_studies')
        .update({ display_order: i })
        .eq('id', studies[i].id);
      
      if (error) throw error;
    }
    return true;
  },

  /**
   * Copy a single study (with all its lessons) to a new organization
   * @param {string} studyId - Source study ID
   * @param {string} targetOwnerSlug - Target organization
   * @returns {object} The new study
   */
  async copyStudyToOrg(studyId, targetOwnerSlug) {
    if (!studyId || !targetOwnerSlug) {
      throw new Error('Study ID and target organization required');
    }
    
    // Get the source study
    const { data: sourceStudy, error: studyError } = await supabase
      .from('bible_studies')
      .select('*')
      .eq('id', studyId)
      .single();
    
    if (studyError || !sourceStudy) {
      throw new Error('Source study not found');
    }
    
    // Check if a copy already exists for this org
    const { data: existing } = await supabase
      .from('bible_studies')
      .select('id')
      .eq('owner_slug', targetOwnerSlug)
      .eq('source_study_id', studyId)
      .maybeSingle();
    
    if (existing) {
      throw new Error('Study already exists for this organization');
    }
    
    // Create the study copy
    const { id: _oldId, created_at: _ca, updated_at: _ua, ...studyData } = sourceStudy;
    const newStudy = {
      ...studyData,
      owner_slug: targetOwnerSlug,
      source_study_id: studyId,
    };
    
    const { data: createdStudy, error: createError } = await supabase
      .from('bible_studies')
      .insert(newStudy)
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Get all lessons from the source study
    const { data: sourceLessons, error: lessonsError } = await supabase
      .from('bible_study_lessons')
      .select('*')
      .eq('study_id', studyId)
      .order('order_index');
    
    if (lessonsError) throw lessonsError;
    
    // Copy all lessons
    if (sourceLessons && sourceLessons.length > 0) {
      const newLessons = sourceLessons.map(lesson => {
        const { id: _lid, created_at: _lca, updated_at: _lua, study_id: _sid, ...lessonData } = lesson;
        return {
          ...lessonData,
          study_id: createdStudy.id,
          source_lesson_id: lesson.id,
        };
      });
      
      const { error: insertLessonsError } = await supabase
        .from('bible_study_lessons')
        .insert(newLessons);
      
      if (insertLessonsError) throw insertLessonsError;
    }
    
    return createdStudy;
  },

  /**
   * Copy all studies from one organization to another
   * @param {string} sourceOwnerSlug - Source organization (use 'default' or 'faithtalkai')
   * @param {string} targetOwnerSlug - Target organization
   * @returns {number} Number of studies copied
   */
  async copyAllStudiesToOrg(sourceOwnerSlug, targetOwnerSlug) {
    if (!targetOwnerSlug || targetOwnerSlug === 'default') {
      throw new Error('Cannot copy to default organization');
    }
    
    // Get all studies from source org
    const { data: sourceStudies, error: fetchError } = await supabase
      .from('bible_studies')
      .select('id, title')
      .eq('owner_slug', sourceOwnerSlug || 'faithtalkai');
    
    if (fetchError) throw fetchError;
    if (!sourceStudies || sourceStudies.length === 0) return 0;
    
    // Check which studies already exist in target org by source_study_id OR by title
    const { data: existingStudies } = await supabase
      .from('bible_studies')
      .select('source_study_id, title')
      .eq('owner_slug', targetOwnerSlug);
    
    const existingSourceIds = new Set((existingStudies || []).map(s => s.source_study_id).filter(Boolean));
    const existingTitles = new Set((existingStudies || []).map(s => s.title?.toLowerCase()).filter(Boolean));
    
    // Filter out studies that already exist (by source_study_id or title)
    const studiesToCopy = sourceStudies.filter(s => 
      !existingSourceIds.has(s.id) && !existingTitles.has(s.title?.toLowerCase())
    );
    
    let copied = 0;
    for (const study of studiesToCopy) {
      try {
        await this.copyStudyToOrg(study.id, targetOwnerSlug);
        copied++;
      } catch (err) {
        console.error(`Failed to copy study ${study.id}:`, err);
      }
    }
    
    return copied;
  },

  /**
   * Reset an org's study back to the source (delete the copy)
   * @param {string} studyId - The org-specific study ID to delete
   */
  async resetStudyToSource(studyId) {
    // First delete all lessons
    await supabase
      .from('bible_study_lessons')
      .delete()
      .eq('study_id', studyId);
    
    // Then delete the study
    const { error } = await supabase
      .from('bible_studies')
      .delete()
      .eq('id', studyId);
    
    if (error) throw error;
  }
};
