import { supabase } from './supabase';

export type StudyProgress = {
  id: string;
  user_id: string;
  study_id: string;
  current_lesson_index: number;
  completed_lessons: number[];
  notes?: string | null;
  label?: string | null;
  participants?: string[] | null;
  last_activity_at: string;
  created_at?: string;
};

export type StudyWithProgress = {
  id: string;
  title: string;
  description?: string | null;
  character_id?: string | null;
  is_premium?: boolean;
  progressId: string;
  progress: StudyProgress;
  lesson_count: number;
};

export async function getStudyProgress(userId: string, studyId: string, progressId?: string): Promise<StudyProgress | null> {
  if (!userId || !studyId) return null;
  try {
    let query = supabase
      .from('user_study_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('study_id', studyId);
    
    // If progressId is specified, get that specific record
    if (progressId) {
      query = query.eq('id', progressId);
    }
    
    // Get most recent progress record
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.warn('[studyProgress] getStudyProgress error:', error);
      return null;
    }
    return data as StudyProgress | null;
  } catch (e) {
    console.warn('[studyProgress] getStudyProgress exception:', e);
    return null;
  }
}

export async function saveStudyProgress(opts: {
  userId: string;
  studyId: string;
  progressId?: string;
  currentLessonIndex?: number;
  completedLessons?: number[];
  notes?: string;
  label?: string;
  createNew?: boolean;
}): Promise<StudyProgress | null> {
  const { userId, studyId, progressId, currentLessonIndex, completedLessons, notes, label, createNew } = opts;
  if (!userId || !studyId) return null;
  
  try {
    const payload: Record<string, any> = {
      user_id: userId,
      study_id: studyId,
      last_activity_at: new Date().toISOString(),
    };
    
    if (currentLessonIndex !== undefined) {
      payload.current_lesson_index = currentLessonIndex;
    }
    if (completedLessons !== undefined) {
      payload.completed_lessons = completedLessons;
    }
    if (notes !== undefined) {
      payload.notes = notes;
    }
    if (label !== undefined) {
      payload.label = label;
    }
    
    let data, error;
    
    // If we have a progressId, update that specific record
    if (progressId) {
      ({ data, error } = await supabase
        .from('user_study_progress')
        .update(payload)
        .eq('id', progressId)
        .select('*')
        .maybeSingle());
    } else if (createNew) {
      // Explicitly create new progress record (for "Start Again" feature)
      ({ data, error } = await supabase
        .from('user_study_progress')
        .insert(payload)
        .select('*')
        .maybeSingle());
    } else {
      // Default: find existing or create new
      const existing = await getStudyProgress(userId, studyId);
      if (existing?.id) {
        ({ data, error } = await supabase
          .from('user_study_progress')
          .update(payload)
          .eq('id', existing.id)
          .select('*')
          .maybeSingle());
      } else {
        ({ data, error } = await supabase
          .from('user_study_progress')
          .insert(payload)
          .select('*')
          .maybeSingle());
      }
    }
    
    if (error) {
      console.warn('[studyProgress] saveStudyProgress error:', error);
      return null;
    }
    return data as StudyProgress | null;
  } catch (e) {
    console.warn('[studyProgress] saveStudyProgress exception:', e);
    return null;
  }
}

export async function markLessonComplete(
  userId: string,
  studyId: string,
  lessonIndex: number
): Promise<StudyProgress | null> {
  const current = await getStudyProgress(userId, studyId);
  const completed = Array.isArray(current?.completed_lessons) ? [...current.completed_lessons] : [];
  
  if (!completed.includes(lessonIndex)) {
    completed.push(lessonIndex);
    completed.sort((a, b) => a - b);
  }
  
  return saveStudyProgress({
    userId,
    studyId,
    currentLessonIndex: lessonIndex,
    completedLessons: completed,
  });
}

export async function markLessonIncomplete(
  userId: string,
  studyId: string,
  lessonIndex: number
): Promise<StudyProgress | null> {
  const current = await getStudyProgress(userId, studyId);
  const completed = Array.isArray(current?.completed_lessons) ? [...current.completed_lessons] : [];
  
  const idx = completed.indexOf(lessonIndex);
  if (idx >= 0) {
    completed.splice(idx, 1);
  }
  
  return saveStudyProgress({
    userId,
    studyId,
    completedLessons: completed,
  });
}

export async function toggleLessonComplete(
  userId: string,
  studyId: string,
  lessonIndex: number
): Promise<{ progress: StudyProgress | null; isNowComplete: boolean }> {
  const current = await getStudyProgress(userId, studyId);
  const completed = Array.isArray(current?.completed_lessons) ? [...current.completed_lessons] : [];
  const wasComplete = completed.includes(lessonIndex);
  
  if (wasComplete) {
    const idx = completed.indexOf(lessonIndex);
    completed.splice(idx, 1);
  } else {
    completed.push(lessonIndex);
    completed.sort((a, b) => a - b);
  }
  
  const progress = await saveStudyProgress({
    userId,
    studyId,
    currentLessonIndex: lessonIndex,
    completedLessons: completed,
  });
  
  return { progress, isNowComplete: !wasComplete };
}

export function getProgressPercent(completedLessons: number[], totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  const count = Array.isArray(completedLessons) ? completedLessons.length : 0;
  return Math.round((count / totalLessons) * 100);
}

/**
 * Get all studies that a user has started (has progress records)
 * Returns study info along with progress data
 */
export async function getUserStudiesWithProgress(userId: string): Promise<StudyWithProgress[]> {
  if (!userId) return [];
  
  try {
    // Get all progress records for this user
    const { data: progressRecords, error: progressError } = await supabase
      .from('user_study_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false });
    
    if (progressError || !progressRecords?.length) return [];
    
    // Get the study details for each progress record
    const studyIds = progressRecords.map(p => p.study_id);
    
    const { data: studies, error: studiesError } = await supabase
      .from('bible_studies')
      .select('id, title, description, character_id, is_premium')
      .in('id', studyIds);
    
    if (studiesError) return [];
    
    // Get lesson counts for each study
    const { data: lessonCounts } = await supabase
      .from('bible_study_lessons')
      .select('study_id')
      .in('study_id', studyIds);
    
    const countMap: Record<string, number> = {};
    if (lessonCounts) {
      for (const lc of lessonCounts) {
        countMap[lc.study_id] = (countMap[lc.study_id] || 0) + 1;
      }
    }
    
    // Combine progress with study info
    const studyMap: Record<string, any> = {};
    for (const s of (studies || [])) {
      studyMap[s.id] = s;
    }
    
    return progressRecords.map(progress => {
      const study = studyMap[progress.study_id];
      if (!study) return null;
      return {
        ...study,
        progressId: progress.id,
        progress: {
          id: progress.id,
          user_id: progress.user_id,
          study_id: progress.study_id,
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
    }).filter(Boolean) as StudyWithProgress[];
  } catch (err) {
    console.warn('[studyProgress] getUserStudiesWithProgress error:', err);
    return [];
  }
}

/**
 * Delete a specific progress record and all linked chats/messages
 */
export async function deleteProgress(progressId: string): Promise<boolean> {
  if (!progressId) return false;
  try {
    // First, find all chats linked to this progress record
    const { data: linkedChats } = await supabase
      .from('chats')
      .select('id')
      .eq('progress_id', progressId);
    
    // Delete messages for each linked chat, then delete the chats
    if (linkedChats && linkedChats.length > 0) {
      const chatIds = linkedChats.map(c => c.id);
      
      // Delete all messages for these chats
      await supabase
        .from('chat_messages')
        .delete()
        .in('chat_id', chatIds);
      
      // Delete the chats themselves
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
    return !error;
  } catch (e) {
    console.warn('[studyProgress] deleteProgress error:', e);
    return false;
  }
}

/**
 * Update the label of a progress record
 */
export async function updateProgressLabel(progressId: string, label: string): Promise<StudyProgress | null> {
  if (!progressId) return null;
  try {
    const { data, error } = await supabase
      .from('user_study_progress')
      .update({ label })
      .eq('id', progressId)
      .select('*')
      .maybeSingle();
    if (error) return null;
    return data as StudyProgress;
  } catch {
    return null;
  }
}
