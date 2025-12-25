import { supabase } from '../services/supabase';
import { getOwnerSlug } from '../services/tierSettingsService';

export const bibleStudiesRepository = {
  async listStudies({ ownerSlug, includePrivate = false, allOwners = false } = {}) {
    try {
      const org = (ownerSlug || getOwnerSlug() || '').trim();
      const wantAll = allOwners || org === '__ALL__' || org === '*';
      
      let query = supabase
        .from('bible_studies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!wantAll) {
        query = query.eq('owner_slug', org.toLowerCase());
      }
      
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
        .upsert(payload, { onConflict: 'user_id,study_id' })
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
