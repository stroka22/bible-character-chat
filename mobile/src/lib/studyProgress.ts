import { supabase } from './supabase';

export type StudyProgress = {
  user_id: string;
  study_id: string;
  current_lesson_index: number;
  completed_lessons: number[];
  notes?: string | null;
  last_activity_at: string;
};

export async function getStudyProgress(userId: string, studyId: string): Promise<StudyProgress | null> {
  if (!userId || !studyId) return null;
  try {
    const { data, error } = await supabase
      .from('user_study_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('study_id', studyId)
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
  currentLessonIndex?: number;
  completedLessons?: number[];
  notes?: string;
}): Promise<StudyProgress | null> {
  const { userId, studyId, currentLessonIndex, completedLessons, notes } = opts;
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
    
    const { data, error } = await supabase
      .from('user_study_progress')
      .upsert(payload, { onConflict: 'user_id,study_id' })
      .select('*')
      .maybeSingle();
    
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
