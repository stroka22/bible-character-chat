// Reading Plans Repository
import { supabase } from '../services/supabase';

export const readingPlansRepository = {
  // Get all active reading plans
  async getAll() {
    const { data, error } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('duration_days', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get a single plan by slug
  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all days for a plan
  async getPlanDays(planId) {
    const { data, error } = await supabase
      .from('reading_plan_days')
      .select('*')
      .eq('plan_id', planId)
      .order('day_number', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get a specific day's reading
  async getPlanDay(planId, dayNumber) {
    const { data, error } = await supabase
      .from('reading_plan_days')
      .select('*')
      .eq('plan_id', planId)
      .eq('day_number', dayNumber)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's progress on a plan
  async getUserProgress(userId, planId) {
    const { data, error } = await supabase
      .from('user_reading_plan_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  // Get all user's active plans with progress
  async getUserPlans(userId) {
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
  },

  // Get all user's completed plans
  async getCompletedPlans(userId) {
    const { data, error } = await supabase
      .from('user_reading_plan_progress')
      .select(`
        *,
        plan:reading_plans(*)
      `)
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('last_activity_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Start a plan for a user
  async startPlan(userId, planId) {
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
  },

  // Mark a day as complete
  async completeDay(userId, planId, dayNumber, totalDays) {
    // First get current progress
    const progress = await this.getUserProgress(userId, planId);
    
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
  },

  // Reset plan progress
  async resetPlan(userId, planId) {
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
  },

  // Leave/delete a plan
  async leavePlan(userId, planId) {
    const { error } = await supabase
      .from('user_reading_plan_progress')
      .delete()
      .eq('user_id', userId)
      .eq('plan_id', planId);
    
    if (error) throw error;
    return true;
  },
};

export default readingPlansRepository;
