import { supabase } from './supabase'
import type { Pet, QRScan } from './supabase'
import QRCodeLib from 'qrcode'

// Pet management functions
export const petService = {
  // Get all pets for a user
  async getUserPets(userId: number) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Get user pets error:', error)
      throw error
    }
  },

  // Get single pet by username
  async getPetByUsername(username: string) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          users (
            id,
            name,
            phone,
            whatsapp,
            instagram,
            address,
            is_active,
            subscriptions (
              status,
              end_date
            )
          )
        `)
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (error) throw error

      // Check if user is active and has valid subscription
      if (!data.users?.is_active) {
        throw new Error('User account is inactive')
      }

      // Check if user has active subscription
      const activeSubscription = data.users.subscriptions?.find(sub => 
        sub.status === 'active' && new Date(sub.end_date) > new Date()
      )

      if (!activeSubscription) {
        throw new Error('User subscription has expired')
      }

      return data
    } catch (error) {
      console.error('Get pet by username error:', error)
      throw error
    }
  },

  // Get single pet by ID
  async getPetById(petId: number) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Get pet by ID error:', error)
      throw error
    }
  },

  // Create new pet
  async createPet(userId: number, petData: {
    name: string
    username: string
    type: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other'
    breed?: string
    age?: string
    color?: string
    description?: string
    photo_url?: string
    show_phone?: boolean
    show_whatsapp?: boolean
    show_instagram?: boolean
    show_address?: boolean
  }) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([{
          user_id: userId,
          name: petData.name,
          username: petData.username,
          type: petData.type,
          breed: petData.breed,
          age: petData.age,
          color: petData.color,
          description: petData.description,
          photo_url: petData.photo_url,
          show_phone: petData.show_phone ?? true,
          show_whatsapp: petData.show_whatsapp ?? true,
          show_instagram: petData.show_instagram ?? true,
          show_address: petData.show_address ?? false,
          qr_code_generated: false,
          total_scans: 0,
          is_active: true,
          is_lost: false
        }])
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Create pet error:', error)
      throw error
    }
  },

  // Update pet
  async updatePet(petId: number, updates: Partial<Pet>) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', petId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Update pet error:', error)
      throw error
    }
  },

  // Delete pet (soft delete)
  async deletePet(petId: number) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update({ is_active: false })
        .eq('id', petId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Delete pet error:', error)
      throw error
    }
  },

  // Generate QR code for pet
  async generateQRCode(petId: number, petUsername: string) {
    try {
      // Generate QR code URL
      const profileUrl = `${window.location.origin}/pet/${petUsername}`
      const qrDataUrl = await QRCodeLib.toDataURL(profileUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      // Update pet with QR code info
      const { data, error } = await supabase
        .from('pets')
        .update({
          qr_code_generated: true,
          qr_code_url: qrDataUrl
        })
        .eq('id', petId)
        .select()
        .single()

      if (error) throw error

      return { qrCode: qrDataUrl, profileUrl, pet: data }
    } catch (error) {
      console.error('Generate QR code error:', error)
      throw error
    }
  },

  // Record QR code scan
  async recordQRScan(petId: number, scanData: {
    scanner_ip?: string
    scanner_location_lat?: number
    scanner_location_lng?: number
    scanner_user_agent?: string
    scanner_country?: string
    scanner_city?: string
  }) {
    try {
      // Insert scan record
      const { data: scanRecord, error: scanError } = await supabase
        .from('qr_scans')
        .insert([{
          pet_id: petId,
          scanner_ip: scanData.scanner_ip,
          scanner_location_lat: scanData.scanner_location_lat,
          scanner_location_lng: scanData.scanner_location_lng,
          scanner_user_agent: scanData.scanner_user_agent,
          scanner_country: scanData.scanner_country,
          scanner_city: scanData.scanner_city,
          whatsapp_shared: false
        }])
        .select()
        .single()

      if (scanError) throw scanError

      // Update pet scan count
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('total_scans')
        .eq('id', petId)
        .single()

      if (!petError && pet) {
        await supabase
          .from('pets')
          .update({
            total_scans: pet.total_scans + 1,
            last_scanned_at: new Date().toISOString()
          })
          .eq('id', petId)
      }

      return scanRecord
    } catch (error) {
      console.error('Record QR scan error:', error)
      throw error
    }
  },

  // Record WhatsApp share
  async recordWhatsAppShare(scanId: number) {
    try {
      const { data, error } = await supabase
        .from('qr_scans')
        .update({
          whatsapp_shared: true,
          whatsapp_shared_at: new Date().toISOString()
        })
        .eq('id', scanId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Record WhatsApp share error:', error)
      throw error
    }
  },

  // Get pet analytics
  async getPetAnalytics(petId: number) {
    try {
      // Get scan history
      const { data: scans, error: scansError } = await supabase
        .from('qr_scans')
        .select('*')
        .eq('pet_id', petId)
        .order('scanned_at', { ascending: false })

      if (scansError) throw scansError

      // Get pet info
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('total_scans, last_scanned_at')
        .eq('id', petId)
        .single()

      if (petError) throw petError

      // Calculate analytics
      const totalScans = pet.total_scans
      const whatsappShares = scans?.filter(scan => scan.whatsapp_shared).length || 0
      const uniqueLocations = scans?.filter(scan => scan.scanner_city).map(scan => scan.scanner_city) || []
      const uniqueCities = [...new Set(uniqueLocations)]

      return {
        totalScans,
        whatsappShares,
        uniqueCities: uniqueCities.length,
        lastScanned: pet.last_scanned_at,
        recentScans: scans?.slice(0, 10) || []
      }
    } catch (error) {
      console.error('Get pet analytics error:', error)
      throw error
    }
  },

  // Mark pet as lost
  async markPetAsLost(petId: number) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update({
          is_lost: true,
          lost_date: new Date().toISOString()
        })
        .eq('id', petId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Mark pet as lost error:', error)
      throw error
    }
  },

  // Mark pet as found
  async markPetAsFound(petId: number) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update({
          is_lost: false,
          found_date: new Date().toISOString()
        })
        .eq('id', petId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Mark pet as found error:', error)
      throw error
    }
  },

  // Get all pets (admin function)
  async getAllPets(limit: number = 50, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          users (
            name,
            email,
            phone
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Get all pets error:', error)
      throw error
    }
  },

  // Search pets (admin function)
  async searchPets(query: string) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          users (
            name,
            email,
            phone
          )
        `)
        .or(`name.ilike.%${query}%,username.ilike.%${query}%,breed.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Search pets error:', error)
      throw error
    }
  }
} 