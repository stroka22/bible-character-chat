// Reading Plans Repository
import { supabase } from '../services/supabase';

export const readingPlansRepository = {
  // Get all active reading plans for an org (merged: org-specific override NULL/shared)
  async getAll(ownerSlug = null) {
    // Fetch plans for org + NULL (shared plans)
    let query = supabase
      .from('reading_plans')
      .select('*')
      .eq('is_active', true);
    
    if (ownerSlug) {
      query = query.or(`owner_slug.eq.${ownerSlug},owner_slug.is.null`);
    }
    
    const { data, error } = await query
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('duration_days', { ascending: true });
    
    if (error) throw error;
    
    // Merge: org-specific plans override NULL plans with same slug
    return this._mergePlans(data || [], ownerSlug);
  },

  // ============================================
  // ADMIN: Get all plans (including inactive) for an org
  // ============================================
  async getAllAdmin(ownerSlug = null) {
    // Fetch plans for org + NULL (shared plans)
    let query = supabase
      .from('reading_plans')
      .select('*');
    
    if (ownerSlug) {
      query = query.or(`owner_slug.eq.${ownerSlug},owner_slug.is.null`);
    }
    
    const { data, error } = await query
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
      .order('title', { ascending: true });
    
    if (error) throw error;
    
    // Merge: org-specific plans override NULL plans with same slug
    return this._mergePlans(data || [], ownerSlug);
  },
  
  // Helper: merge plans - org-specific overrides NULL/shared plans with same slug
  _mergePlans(plans, ownerSlug) {
    if (!ownerSlug) return plans;
    
    const plansBySlug = new Map();
    
    // First add NULL/shared plans
    for (const plan of plans) {
      if (!plan.owner_slug) {
        plansBySlug.set(plan.slug, plan);
      }
    }
    
    // Then override with org-specific plans
    for (const plan of plans) {
      if (plan.owner_slug === ownerSlug) {
        plansBySlug.set(plan.slug, plan);
      }
    }
    
    return Array.from(plansBySlug.values());
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

  // Unmark a day as complete
  async uncompleteDay(userId, planId, dayNumber) {
    // First get current progress
    const progress = await this.getUserProgress(userId, planId);
    
    if (!progress) {
      throw new Error('No progress found for this plan');
    }

    const completedDays = (progress.completed_days || []).filter(d => d !== dayNumber);

    const { data, error } = await supabase
      .from('user_reading_plan_progress')
      .update({
        completed_days: completedDays,
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

  // ============================================
  // COPY-ON-WRITE: Org-specific plan management
  // ============================================

  /**
   * Copy a single reading plan (with all its days) to a new organization
   * @param {string} planId - Source plan ID
   * @param {string} targetOwnerSlug - Target organization
   * @returns {object} The new plan
   */
  async copyPlanToOrg(planId, targetOwnerSlug) {
    if (!planId || !targetOwnerSlug) {
      throw new Error('Plan ID and target organization required');
    }
    
    // Get the source plan
    const { data: sourcePlan, error: planError } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (planError || !sourcePlan) {
      throw new Error('Source plan not found');
    }
    
    // Check if a copy already exists for this org
    const { data: existing } = await supabase
      .from('reading_plans')
      .select('id')
      .eq('owner_slug', targetOwnerSlug)
      .eq('source_plan_id', planId)
      .maybeSingle();
    
    if (existing) {
      throw new Error('Plan already exists for this organization');
    }
    
    // Create the plan copy with a unique slug
    const { id: _oldId, created_at: _ca, updated_at: _ua, slug: oldSlug, ...planData } = sourcePlan;
    const newPlan = {
      ...planData,
      slug: `${oldSlug}-${targetOwnerSlug}`,
      owner_slug: targetOwnerSlug,
      source_plan_id: planId,
    };
    
    const { data: createdPlan, error: createError } = await supabase
      .from('reading_plans')
      .insert(newPlan)
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Get all days from the source plan
    const { data: sourceDays, error: daysError } = await supabase
      .from('reading_plan_days')
      .select('*')
      .eq('plan_id', planId)
      .order('day_number');
    
    if (daysError) throw daysError;
    
    // Copy all days
    if (sourceDays && sourceDays.length > 0) {
      const newDays = sourceDays.map(day => {
        const { id: _did, created_at: _dca, plan_id: _pid, ...dayData } = day;
        return {
          ...dayData,
          plan_id: createdPlan.id,
          source_day_id: day.id,
        };
      });
      
      const { error: insertDaysError } = await supabase
        .from('reading_plan_days')
        .insert(newDays);
      
      if (insertDaysError) throw insertDaysError;
    }
    
    return createdPlan;
  },

  /**
   * Copy all reading plans from one organization to another
   * @param {string} sourceOwnerSlug - Source organization (use null for default/unowned plans)
   * @param {string} targetOwnerSlug - Target organization
   * @returns {number} Number of plans copied
   */
  async copyAllPlansToOrg(sourceOwnerSlug, targetOwnerSlug) {
    if (!targetOwnerSlug) {
      throw new Error('Cannot copy to empty organization');
    }
    
    // Get all plans from source org (NULL means plans without an owner)
    let query = supabase
      .from('reading_plans')
      .select('id, title, slug');
    
    if (sourceOwnerSlug === null) {
      query = query.is('owner_slug', null);
    } else {
      query = query.eq('owner_slug', sourceOwnerSlug);
    }
    
    const { data: sourcePlans, error: fetchError } = await query;
    
    if (fetchError) throw fetchError;
    if (!sourcePlans || sourcePlans.length === 0) return 0;
    
    // Check which plans already exist in target org by source_plan_id OR by slug
    const { data: existingPlans } = await supabase
      .from('reading_plans')
      .select('source_plan_id, slug')
      .eq('owner_slug', targetOwnerSlug);
    
    const existingSourceIds = new Set((existingPlans || []).map(p => p.source_plan_id).filter(Boolean));
    const existingSlugs = new Set((existingPlans || []).map(p => p.slug).filter(Boolean));
    
    // Filter out plans that already exist (by source_plan_id or slug)
    const plansToCopy = sourcePlans.filter(p => 
      !existingSourceIds.has(p.id) && !existingSlugs.has(p.slug)
    );
    
    let copied = 0;
    for (const plan of plansToCopy) {
      try {
        await this.copyPlanToOrg(plan.id, targetOwnerSlug);
        copied++;
      } catch (err) {
        console.error(`Failed to copy plan ${plan.id}:`, err);
      }
    }
    
    return copied;
  },

  /**
   * Reset an org's plan back to the source (delete the copy)
   * @param {string} planId - The org-specific plan ID to delete
   */
  async resetPlanToSource(planId) {
    // First delete all days
    await supabase
      .from('reading_plan_days')
      .delete()
      .eq('plan_id', planId);
    
    // Then delete the plan
    const { error } = await supabase
      .from('reading_plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
  }
};

export default readingPlansRepository;
