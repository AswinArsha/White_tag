import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types (based on our schema)
export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  phone?: string
  whatsapp?: string
  instagram?: string
  address?: string
  is_active: boolean
  is_demo: boolean
  email_verified: boolean
  email_verified_at?: string
  created_at: string
  updated_at: string
}

// Updated Pet interface for src/lib/supabase.ts
export interface Pet {
  id: number
  user_id: number
  name: string
  username: string
  type: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other'
  breed?: string
  age?: string
  color?: string
  description?: string
  photo_url?: string
  // Contact information fields (newly added)
  whatsapp?: string
  instagram?: string
  address?: string
  // Privacy settings
  show_phone: boolean
  show_whatsapp: boolean
  show_instagram: boolean
  show_address: boolean
  qr_code_generated: boolean
  qr_code_url?: string
  total_scans: number
  last_scanned_at?: string
  is_active: boolean
  is_lost: boolean
  lost_date?: string
  found_date?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  user_id: number
  plan_type: 'annual' | 'monthly'
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  amount: number
  currency: string
  start_date: string
  end_date: string
  payment_method?: string
  payment_reference?: string
  created_at: string
  updated_at: string
}

export interface QRScan {
  id: number
  pet_id: number
  scanner_ip?: string
  scanner_location_lat?: number
  scanner_location_lng?: number
  scanner_user_agent?: string
  scanner_country?: string
  scanner_city?: string
  whatsapp_shared: boolean
  whatsapp_shared_at?: string
  scanned_at: string
}

export interface Admin {
  id: number
  email: string
  password_hash: string
  name: string
  role: 'super_admin' | 'admin' | 'support'
  permissions?: any
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface SupportTicket {
  id: number
  user_id?: number
  admin_id?: number
  pet_id?: number
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'lost_pet' | 'account' | 'other'
  contact_email?: string
  contact_phone?: string
  created_at: string
  updated_at: string
  resolved_at?: string
} 