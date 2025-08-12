// src/lib/subscriptionPlans.ts
import { supabase } from './supabase'

export interface SubscriptionPlan {
  id: number
  name: string
  description?: string
  duration_months: number
  amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const subscriptionPlansService = {
  // Get all active subscription plans
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('amount', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Get active plans error:', error)
      throw error
    }
  },

  // Get all subscription plans (including inactive)
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Get all plans error:', error)
      throw error
    }
  },

  // Create a new subscription plan
  async createPlan(planData: {
    name: string
    description?: string
    duration_months: number
    amount: number
  }): Promise<SubscriptionPlan> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([{
          name: planData.name,
          description: planData.description,
          duration_months: planData.duration_months,
          amount: planData.amount,
          is_active: true
        }])
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Create plan error:', error)
      throw error
    }
  },

  // Update subscription plan
  async updatePlan(planId: number, updates: {
    name?: string
    description?: string
    duration_months?: number
    amount?: number
    is_active?: boolean
  }): Promise<SubscriptionPlan> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Update plan error:', error)
      throw error
    }
  },

  // Delete subscription plan (soft delete by setting is_active to false)
  async deletePlan(planId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', planId)

      if (error) throw error
    } catch (error) {
      console.error('Delete plan error:', error)
      throw error
    }
  },

  // Get plan by ID
  async getPlanById(planId: number): Promise<SubscriptionPlan> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Get plan by ID error:', error)
      throw error
    }
  }
}