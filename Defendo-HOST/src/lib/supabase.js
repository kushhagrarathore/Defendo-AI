import { createClient } from '@supabase/supabase-js'

// Get these from environment variables or replace with your actual values
// You can find these in your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://grmutjpyqzupdoimrtcg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdybXV0anB5cXp1cGRvaW1ydGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MDg3NjQsImV4cCI6MjA2NzE4NDc2NH0.V_a4lnzTIQvWY2aT1et5u9AP7zvz_DFqSRg5LTiyJgw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions for Host-only platform
export const auth = {
  // Host signup (WebApp) - database trigger creates host profile automatically
  signUpHost: async (email, password, fullName, phone, companyName, address = '') => {
    // Sign up user - database trigger will automatically create host profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "host",
          full_name: fullName,
          phone: phone,
          company_name: companyName,
          address: address,
        },
      },
    })

    if (authError) {
      console.error("Auth signup error:", authError.message)
      return { data: null, error: authError }
    }

    // Host profile will be created automatically by database trigger
    return { data: authData, error: null }
  },

  // Regular user signup - redirects to host signup since this is host-only platform
  signUpUser: async (email, password, fullName, phone) => {
    // This platform is host-only, so redirect to host signup
    console.warn("This platform is host-only. Redirecting to host signup.")
    return await this.signUpHost(email, password, fullName, phone, '', '')
  },

  // Host login
  loginHost: async (email, password) => {
    console.log("Attempting login for:", email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error("Login error:", error.message)
      return { data: null, error }
    }

    console.log("Auth successful, fetching host profile for user:", data.user.id)

    // Fetch host profile
    const { data: host, error: hostError } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (hostError) {
      console.error("Host profile fetch error:", hostError.message)
      // Don't return error here, just log it - user can still login without profile
    } else {
      console.log("Host profile loaded successfully:", host)
    }

    return { data: { auth: data, host }, error: null }
  },

  // User login
  loginUser: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error("Login error:", error.message)
      return { data: null, error }
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError.message)
    }

    return { data: { auth: data, profile }, error: null }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Legacy methods for backward compatibility
  signUp: async (email, password, userData = {}) => {
    if (userData.role === "host") {
      return await auth.signUpHost(
        email, 
        password, 
        userData.full_name || '', 
        userData.phone || '', 
        userData.company_name || '',
        userData.address || ''
      )
    } else {
      return await auth.signUpUser(
        email, 
        password, 
        userData.full_name || '', 
        userData.phone || ''
      )
    }
  },

  signIn: async (email, password) => {
    // Try to determine user type by checking both tables
    const { data: hostProfile } = await supabase
      .from('host_profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    if (hostProfile) {
      return await auth.loginHost(email, password)
    } else {
      return await auth.loginUser(email, password)
    }
  }
}

// Database helper functions (Host-only platform)
export const db = {
  // Get host profile
  getHostProfile: async (hostId) => {
    const { data, error } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('id', hostId)
      .single()
    return { data, error }
  },

  // Update host profile
  updateHostProfile: async (hostId, updates) => {
    const { data, error } = await supabase
      .from('host_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', hostId)
      .select()
    return { data, error }
  },

  // Get host bookings
  getHostBookings: async (hostId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
    return { data, error }
  },

  // Get host emergency contacts
  getEmergencyContacts: async (hostId) => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('host_id', hostId)
      .order('is_primary', { ascending: false })
    return { data, error }
  },

  // Add emergency contact
  addEmergencyContact: async (hostId, contactData) => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        host_id: hostId,
        ...contactData
      })
      .select()
    return { data, error }
  }
}
