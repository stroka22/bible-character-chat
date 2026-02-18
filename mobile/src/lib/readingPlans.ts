// Reading Plans library for mobile
import { supabase } from './supabase';

export interface ReadingPlan {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_days: number;
  category: string;
  difficulty: string;
  is_featured: boolean;
}

export interface PlanDay {
  id: string;
  plan_id: string;
  day_number: number;
  title: string | null;
  readings: Array<{
    book: string;
    chapter: number;
    verses?: string;
  }>;
  reflection_prompt: string | null;
  context: string | null; // Day's teaching/explanation content
}

export interface UserPlanProgress {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  current_day: number;
  completed_days: number[];
  is_completed: boolean;
  last_activity_at: string;
  plan?: ReadingPlan;
}

// Get all active reading plans
export async function getReadingPlans(): Promise<ReadingPlan[]> {
  const { data, error } = await supabase
    .from('reading_plans')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('duration_days', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get a single plan by slug
export async function getPlanBySlug(slug: string): Promise<ReadingPlan | null> {
  const { data, error } = await supabase
    .from('reading_plans')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Get all days for a plan
export async function getPlanDays(planId: string): Promise<PlanDay[]> {
  const { data, error } = await supabase
    .from('reading_plan_days')
    .select('*')
    .eq('plan_id', planId)
    .order('day_number', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get user's progress on a plan
export async function getUserProgress(userId: string, planId: string): Promise<UserPlanProgress | null> {
  const { data, error } = await supabase
    .from('user_reading_plan_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Get all user's active plans with progress
export async function getUserPlans(userId: string): Promise<UserPlanProgress[]> {
  const { data, error } = await supabase
    .from('user_reading_plan_progress')
    .select(`
      *,
      plan:reading_plans(*)
    `)
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('last_activity_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Start a plan
export async function startPlan(userId: string, planId: string): Promise<UserPlanProgress> {
  const { data, error } = await supabase
    .from('user_reading_plan_progress')
    .upsert({
      user_id: userId,
      plan_id: planId,
      start_date: new Date().toISOString().split('T')[0],
      current_day: 1,
      completed_days: [],
      is_completed: false,
      last_activity_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,plan_id',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Mark a day as complete
export async function completeDay(
  userId: string, 
  planId: string, 
  dayNumber: number, 
  totalDays: number
): Promise<UserPlanProgress> {
  const progress = await getUserProgress(userId, planId);
  
  if (!progress) {
    throw new Error('No progress found for this plan');
  }

  const completedDays = progress.completed_days || [];
  if (!completedDays.includes(dayNumber)) {
    completedDays.push(dayNumber);
  }

  const isCompleted = completedDays.length >= totalDays;
  const nextDay = Math.min(dayNumber + 1, totalDays);

  const { data, error } = await supabase
    .from('user_reading_plan_progress')
    .update({
      completed_days: completedDays,
      current_day: nextDay,
      is_completed: isCompleted,
      last_activity_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Unmark a day as complete
export async function uncompleteDay(
  userId: string,
  planId: string,
  dayNumber: number
): Promise<UserPlanProgress> {
  const progress = await getUserProgress(userId, planId);
  
  if (!progress) {
    throw new Error('No progress found for this plan');
  }

  const completedDays = (progress.completed_days || []).filter(d => d !== dayNumber);
  
  // If uncompleting, set current day to this day
  const currentDay = dayNumber;

  const { data, error } = await supabase
    .from('user_reading_plan_progress')
    .update({
      completed_days: completedDays,
      current_day: currentDay,
      is_completed: false,
      last_activity_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Reset plan progress
export async function resetPlan(userId: string, planId: string): Promise<UserPlanProgress> {
  const { data, error } = await supabase
    .from('user_reading_plan_progress')
    .update({
      start_date: new Date().toISOString().split('T')[0],
      current_day: 1,
      completed_days: [],
      is_completed: false,
      last_activity_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Leave/delete a plan
export async function leavePlan(userId: string, planId: string): Promise<void> {
  const { error } = await supabase
    .from('user_reading_plan_progress')
    .delete()
    .eq('user_id', userId)
    .eq('plan_id', planId);
  
  if (error) throw error;
}
