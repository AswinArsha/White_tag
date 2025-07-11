import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/auth'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '@/lib/supabase'

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  isDemo: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, userData: any) => Promise<void>
  demoLogin: () => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const result = await authService.getCurrentUser()
        setUser(result.user)
        setProfile(result.profile)
        setIsDemo(result.isDemoUser || false)
        setIsAdmin(result.isAdmin || false)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await authService.login(email, password)
      setUser(result.user)
      setProfile(result.profile)
      setIsDemo(false)
      setIsAdmin(false)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true)
      const result = await authService.register(email, password, userData)
      setUser(result.user)
      setProfile(result.profile)
      setIsDemo(false)
      setIsAdmin(false)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async () => {
    try {
      setLoading(true)
      const result = await authService.demoLogin()
      setUser(result.user)
      setProfile(result.profile)
      setIsDemo(true)
      setIsAdmin(false)
    } catch (error) {
      console.error('Demo login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await authService.adminLogin(email, password)
      setUser(null) // Admin uses separate auth
      setProfile(result.admin as any) // Cast admin to user type for simplicity
      setIsDemo(false)
      setIsAdmin(true)
    } catch (error) {
      console.error('Admin login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
      setProfile(null)
      setIsDemo(false)
      setIsAdmin(false)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (profile && !isDemo && !isAdmin) {
        const updatedProfile = await authService.updateProfile(profile.id, updates)
        setProfile(updatedProfile)
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    isDemo,
    isAdmin,
    login,
    register,
    demoLogin,
    adminLogin,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 