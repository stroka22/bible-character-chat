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
      .order('display_order', { ascending: true })
      .order('duration_days', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // ============================================
  // ADMIN: Get all plans (including inactive)
  // ============================================
  async getAllAdmin() {
    const { data, error } = await supabase
      .from('reading_plans')
      .select('*')
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
      .order('title', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // ============================================
  // ADMIN: Get all categories
  // ============================================
  async getCategories() {
    const { data, error } = await supabase
      .from('reading_plan_categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // ============================================
  // ADMIN: Create category
  // ============================================
  async createCategory(category) {
    const { data, error } = await supabase
      .from('reading_plan_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================
  // ADMIN: Update category
  // ============================================
  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('reading_plan_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================
  // ADMIN: Delete category
  // ============================================
  async deleteCategory(id) {
    const { error } = await supabase
      .from('reading_plan_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // ============================================
  // ADMIN: Create reading plan
  // ============================================
  async createPlan(plan) {
    const { data, error } = await supabase
      .from('reading_plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================
  // ADMIN: Update reading plan
  // ============================================
  async updatePlan(id, updates) {
    const { data, error } = await supabase
      .from('reading_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================
  // ADMIN: Delete reading plan
  // ============================================
  async deletePlan(id) {
    const { error } = await supabase
      .from('reading_plans')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // ============================================
  // ADMIN: Toggle featured status
  // ============================================
  async toggleFeatured(id, isFeatured) {
    const { data, error } = await supabase
      .from('reading_plans')
      .update({ is_featured: isFeatured })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================
  // ADMIN: Update plan category
  // ============================================
  async updatePlanCategory(id, category) {
    const { data, error } = await supabase
      .from('reading_plans')
      .update({ category })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================
  // ADMIN: Reorder plans within category
  // ============================================
  async reorderPlans(category, planIds) {
    const { error } = await supabase.rpc('reorder_reading_plans', {
      p_category: category,
      p_plan_ids: planIds,
    });
    
    if (error) throw error;
    return true;
  },

  // ============================================
  // ADMIN: Reorder featured plans
  // ============================================
  async reorderFeatured(planIds) {
    const { error } = await supabase.rpc('reorder_featured_plans', {
      p_plan_ids: planIds,
    });
    
    if (error) throw error;
    return true;
  },

  // ============================================
  // ADMIN: Update plan day
  // ============================================
  async updatePlanDay(dayId, updates) {
    const { data, error } = await supabase
      .from('reading_plan_days')
      .update(updates)
      .eq('id', dayId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================
  // ADMIN: Bulk update display order
  // ============================================
  async bulkUpdateOrder(updates) {
    // updates is array of { id, display_order }
    const promises = updates.map(({ id, display_order }) =>
      supabase
        .from('reading_plans')
        .update({ display_order })
        .eq('id', id)
    );
    
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) throw errors[0].error;
    return true;
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
