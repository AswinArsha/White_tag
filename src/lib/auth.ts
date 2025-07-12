import { supabase } from './supabase'
import { passwordService } from './password'
import type { User } from './supabase'

// Authentication functions
export const authService = {
  // Register new user (using our custom auth system)
  async register(email: string, password: string, userData: {
    name: string
    phone?: string
    whatsapp?: string
    instagram?: string
    address?: string
  }) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single()

      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      // Hash the password
      const hashedPassword = await passwordService.hash(password)
      
      // Insert user data into our users table
      const { data: newUser, error: dbError } = await supabase
        .from('users')
        .insert([{
          email,
          password_hash: hashedPassword,
          name: userData.name,
          phone: userData.phone,
          whatsapp: userData.whatsapp,
          instagram: userData.instagram,
          address: userData.address,
          is_active: true,
          is_demo: false,
          email_verified: false
        }])
        .select()
        .single()

      if (dbError) throw dbError

      // Store user session after successful registration
      localStorage.setItem('whitetag_user_id', newUser.id.toString())

      return { user: null, profile: newUser }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  // Login user (using our custom auth system)
  async login(email: string, password: string) {
    try {
      // Get user from our custom users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error) throw error

      if (!user) {
        // Check if this might be an admin trying to login on wrong page
        if (email.includes('admin')) {
          throw new Error('Admin accounts must login at /admin/login page')
        }
        throw new Error('User not found')
      }

      // Verify password against stored hash
      const isPasswordValid = await passwordService.verify(password, user.password_hash)
      
      if (!isPasswordValid) {
        throw new Error('Invalid login credentials')
      }

      // Store user session in localStorage
      localStorage.setItem('whitetag_user_id', user.id.toString())
      
      // For our custom auth, we don't use Supabase Auth
      // We'll just return the user profile
      return { user: null, profile: user }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  // Admin login
  async adminLogin(email: string, password: string) {
    try {
      // Get admin from database
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error) throw error

      if (!admin) {
        throw new Error('Admin not found')
      }

      // Verify password against stored hash
      const isPasswordValid = await passwordService.verify(password, admin.password_hash)
      
      if (!isPasswordValid) {
        throw new Error('Invalid admin credentials')
      }

      // Update last login
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id)

      // Store admin session
      localStorage.setItem('whitetag_admin_id', admin.id.toString())

      return { admin, isAdminUser: true }
    } catch (error) {
      console.error('Admin login error:', error)
      throw error
    }
  },

  // Logout
  async logout() {
    try {
      // Clear our custom session
      localStorage.removeItem('whitetag_user_id')
      localStorage.removeItem('whitetag_admin_id')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  // Get current user (for our custom auth, we'll use localStorage)
  async getCurrentUser() {
    try {
      // Check for admin session first
      const adminId = localStorage.getItem('whitetag_admin_id')
      if (adminId) {
        const { data: admin, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', parseInt(adminId))
          .eq('is_active', true)
          .single()

        if (admin && !error) {
          return { user: null, profile: admin as any, isAdmin: true }
        } else {
          localStorage.removeItem('whitetag_admin_id')
        }
      }

      // Check for user session
      const storedUserId = localStorage.getItem('whitetag_user_id')
      if (!storedUserId) {
        return { user: null, profile: null }
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', parseInt(storedUserId))
        .eq('is_active', true)
        .single()

      if (profileError || !profile) {
        // Clear invalid session
        localStorage.removeItem('whitetag_user_id')
        return { user: null, profile: null }
      }

      return { user: null, profile }
    } catch (error) {
      console.error('Get current user error:', error)
      localStorage.removeItem('whitetag_user_id')
      localStorage.removeItem('whitetag_admin_id')
      return { user: null, profile: null }
    }
  },

  // Check subscription status
  async getSubscriptionStatus(userId: number) {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (subscription) {
        const endDate = new Date(subscription.end_date)
        const today = new Date()
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        return {
          isActive: endDate > today,
          daysRemaining: Math.max(0, daysRemaining),
          planType: subscription.plan_type,
          endDate: subscription.end_date
        }
      }

      return {
        isActive: false,
        daysRemaining: 0,
        planType: 'annual',
        endDate: null
      }
    } catch (error) {
      console.error('Subscription status error:', error)
      return {
        isActive: false,
        daysRemaining: 0,
        planType: 'annual',
        endDate: null
      }
    }
  },

  // Update user profile
  async updateProfile(userId: number, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }
} 