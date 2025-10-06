import { createClient } from '@supabase/supabase-js'

// Get these from environment variables or replace with your actual values
// You can find these in your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://grmutjpyqzupdoimrtcg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdybXV0anB5cXp1cGRvaW1ydGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MDg3NjQsImV4cCI6MjA2NzE4NDc2NH0.V_a4lnzTIQvWY2aT1et5u9AP7zvz_DFqSRg5LTiyJgw'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key present:', !!supabaseAnonKey)

// Reuse a single client across HMR to avoid losing session/state
let client
if (typeof window !== 'undefined' && window.__SUPABASE__) {
  client = window.__SUPABASE__
} else {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  if (typeof window !== 'undefined') {
    window.__SUPABASE__ = client
  }
}

export const supabase = client

// Ensure this module stays hot-acceptable to avoid full reloads
if (import.meta.hot) {
  import.meta.hot.accept()
}

// Global error handler for Supabase errors
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error in ${context}:`, error)
  
  if (error?.message?.includes('Invalid Refresh Token') || 
      error?.message?.includes('Refresh Token Not Found') ||
      error?.message?.includes('JWT')) {
    console.log('Refresh token error detected, clearing session')
    // Clear the session and redirect to login
    supabase.auth.signOut()
    return { shouldRetry: false, shouldSignOut: true }
  }
  
  if (error?.code === 'PGRST116' || error?.message?.includes('406')) {
    console.log('Resource not found or access denied')
    return { shouldRetry: false, shouldSignOut: false }
  }
  
  return { shouldRetry: true, shouldSignOut: false }
}

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
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error("Login error:", error.message)
        return { data: null, error }
      }

      console.log("Auth successful, user:", data.user)
      console.log("Session:", data.session)

      // Fetch host profile
      console.log("Fetching host profile for user:", data.user.id)
      const { data: host, error: hostError } = await supabase
        .from("host_profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle()

      if (hostError) {
        console.error("Host profile fetch error:", hostError.message)
        console.log("Continuing without host profile...")
        // Don't return error here, just log it - user can still login without profile
      } else {
        console.log("Host profile loaded successfully:", host)
      }

      const result = { data: { auth: data, host }, error: null }
      console.log("Returning login result:", result)
      return result
    } catch (err) {
      console.error("Exception in loginHost:", err)
      return { data: null, error: { message: err.message } }
    }
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
      .select('id, status, date, created_at, service_type, price, payment_status, user_id, host_id:provider_id, start_time, end_time, location, user_notes')
      .eq('provider_id', hostId)
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
      .eq('user_id', hostId)
      .order('is_primary', { ascending: false })
    return { data, error }
  },

  // Add emergency contact
  addEmergencyContact: async (hostId, contactData) => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: hostId,
        ...contactData
      })
      .select()
    return { data, error }
  },

  // Host Services CRUD operations
  getHostServices: async (hostId) => {
    const { data, error } = await supabase
      .from('host_services')
      .select('*')
      .eq('provider_id', hostId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getHostServiceById: async (serviceId) => {
    const { data, error } = await supabase
      .from('host_services')
      .select('*')
      .eq('id', serviceId)
      .single()
    return { data, error }
  },

  addHostService: async (hostId, serviceData) => {
    const { data, error } = await supabase
      .from('host_services')
      .insert({
        provider_id: hostId,
        ...serviceData
      })
      .select()
    return { data, error }
  },

  updateHostService: async (serviceId, updates) => {
    const { data, error } = await supabase
      .from('host_services')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
    return { data, error }
  },

  deleteHostService: async (serviceId) => {
    const { data, error } = await supabase
      .from('host_services')
      .delete()
      .eq('id', serviceId)
    return { data, error }
  },

  getAllActiveServices: async () => {
    const { data, error } = await supabase
      .from('host_services')
      .select(`
        *,
        host_profiles!inner(
          id,
          full_name,
          company_name,
          rating,
          verified
        )
      `)
      .eq('is_active', true)
      .order('rating', { ascending: false })
    return { data, error }
  },

  // ===== Dashboard Stats =====
  getActiveServiceCount: async (hostId) => {
    // Avoid head:true to ensure some backends/policies still return count
    const { count, error, data } = await supabase
      .from('host_services')
      .select('id', { count: 'exact' })
      .eq('provider_id', hostId)
      .eq('is_active', true)
    if (error) return { count: 0, error }
    // Fallback: if count is null/0 but data exists under RLS quirks
    if ((count === null || count === 0) && Array.isArray(data) && data.length > 0) {
      return { count: data.length, error: null }
    }
    // Secondary fallback: fetch rows and count client-side
    if (!count) {
      const { data: rows, error: e2 } = await supabase
        .from('host_services')
        .select('id')
        .eq('provider_id', hostId)
        .eq('is_active', true)
      return { count: (rows || []).length, error: e2 || null }
    }
    return { count: count || 0, error: null }
  },

  getAllServicesCount: async (hostId) => {
    const { count, error, data } = await supabase
      .from('host_services')
      .select('id', { count: 'exact' })
      .eq('provider_id', hostId)
    if (error) return { count: 0, error }
    if ((count === null || count === 0) && Array.isArray(data) && data.length > 0) {
      return { count: data.length, error: null }
    }
    if (!count) {
      const { data: rows, error: e2 } = await supabase
        .from('host_services')
        .select('id')
        .eq('provider_id', hostId)
      return { count: (rows || []).length, error: e2 || null }
    }
    return { count: count || 0, error: null }
  },

  getTotalBookingsCount: async (hostId) => {
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', hostId)
    return { count: count || 0, error }
  },

  getUpcomingBookingsCount: async (hostId) => {
    const nowIso = new Date().toISOString()
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', hostId)
      .gte('date', nowIso)
      .in('status', ['pending','confirmed'])
    return { count: count || 0, error }
  },

  getCompletedBookingsCount: async (hostId) => {
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', hostId)
      .eq('status', 'completed')
    return { count: count || 0, error }
  },

  getMonthlyRevenue: async (hostId) => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('bookings')
      .select('price, payment_status, date')
      .eq('provider_id', hostId)
      .gte('date', start.toISOString())
    if (error) return { revenue: 0, error }
    const revenue = (data || [])
      .filter(b => (b.payment_status || '').toLowerCase() === 'paid')
      .reduce((sum, b) => sum + (Number(b.price) || 0), 0)
    return { revenue, error: null }
  },

  // Monthly analytics for charts (last 6 months)
  getMonthlyAnalytics: async (hostId, months = 6) => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - (months - 1))
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    // Fetch bookings within range
    const { data, error } = await supabase
      .from('bookings')
      .select('price, payment_status, date')
      .eq('provider_id', hostId)
      .gte('date', start.toISOString().slice(0, 10))
      .lte('date', end.toISOString().slice(0, 10))

    if (error) return { data: [], error }

    // Prepare month buckets
    const buckets = new Map()
    for (let i = 0; i < months; i++) {
      const d = new Date(start)
      d.setMonth(start.getMonth() + i)
      const key = d.toISOString().slice(0, 7) // YYYY-MM
      buckets.set(key, { name: d.toLocaleString('en-US', { month: 'short' }), bookings: 0, revenue: 0 })
    }

    // Aggregate
    ;(data || []).forEach(b => {
      const key = (b.date || '').slice(0, 7)
      if (buckets.has(key)) {
        const row = buckets.get(key)
        row.bookings += 1
        if ((b.payment_status || '').toLowerCase() === 'paid') {
          row.revenue += Number(b.price) || 0
        }
      }
    })

    return { data: Array.from(buckets.values()), error: null }
  },

  getTotalEarnings: async (hostId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('price, payment_status')
      .eq('provider_id', hostId)
    if (error) return { revenue: 0, error }
    const revenue = (data || [])
      .filter(b => (b.payment_status || '').toLowerCase() === 'paid')
      .reduce((sum, b) => sum + (Number(b.price) || 0), 0)
    return { revenue, error: null }
  },

  getHostRating: async (hostId) => {
    const { data, error } = await supabase
      .from('host_profiles')
      .select('rating')
      .eq('id', hostId)
      .single()
    return { rating: data?.rating || 0, error }
  },

  getRecentBookings: async (hostId, limit = 5) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, service_type, status, created_at, price, host_id:provider_id')
      .eq('provider_id', hostId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data: data || [], error }
  },

  // Upcoming bookings with customer name
  getUpcomingBookingsDetailed: async (hostId, limit = 5) => {
    const nowIso = new Date().toISOString()
    // First pull upcoming bookings for this host
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, service_type, status, date, start_time, end_time, location, user_id')
      .eq('provider_id', hostId)
      .gte('date', nowIso)
      .in('status', ['pending','confirmed'])
      .order('date', { ascending: true })
      .limit(limit)
    if (error) return { data: [], error }

    const userIds = Array.from(new Set((bookings || []).map(b => b.user_id).filter(Boolean)))
    let usersMap = new Map()
    if (userIds.length) {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)
      if (!pErr && profiles) {
        usersMap = new Map(profiles.map(u => [u.id, u.full_name]))
      }
    }

    const detailed = (bookings || []).map(b => ({
      ...b,
      customer_name: usersMap.get(b.user_id) || 'Customer'
    }))
    return { data: detailed, error: null }
  },

  // Create a booking as an end-user. user_id is inferred from session if not provided.
  createBooking: async ({ providerId, serviceType, date, startTime, endTime, price, currency = 'INR', userNotes = '', location = null }) => {
    const { data: sessionData } = await supabase.auth.getUser()
    const currentUserId = sessionData?.user?.id
    const insertPayload = {
      user_id: currentUserId,
      provider_id: providerId,
      service_type: serviceType,
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      price: price ?? 0,
      currency,
      user_notes: userNotes || '',
      location: location || null,
      status: 'pending'
    }
    const { data, error } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select('id, user_id, provider_id, service_type, date, start_time, end_time, price, currency, status')
      .single()
    return { data, error }
  },

  // Host-visible summary: id, customer name, start/end, service type
  getHostBookingSummaries: async (hostId, limit = 20) => {
    // Use security-invoker view aligned with schema
    const { data, error } = await supabase
      .from('host_booking_summaries')
      .select('id, service_type, date, start_time, end_time, user_name')
      .order('start_time', { ascending: false })
      .limit(limit)
    return { data: data || [], error }
  },

  // User-visible summary: service_type, price, start/end/date
  getUserBookingSummaries: async (userId, limit = 20) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, service_type, price, currency, date, start_time, end_time, status')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)
    return { data: data || [], error }
  },

  getDailyBookingsStats: async (hostId, days = 7) => {
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('bookings')
      .select('id, created_at')
      .eq('provider_id', hostId)
      .gte('created_at', start.toISOString())
    if (error) return { data: [], error }
    const map = new Map()
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      map.set(key, 0)
    }
    ;(data || []).forEach(b => {
      const key = (b.created_at || '').slice(0, 10)
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1)
    })
    const series = Array.from(map.entries()).map(([date, count]) => ({ date, count }))
    return { data: series, error: null }
  },

  getHostStats: async (hostId) => {
    const [a, totalServices, b, c, d, e, f] = await Promise.all([
      db.getActiveServiceCount(hostId),
      db.getAllServicesCount(hostId),
      db.getTotalBookingsCount(hostId),
      db.getMonthlyRevenue(hostId),
      db.getHostRating(hostId),
      db.getUpcomingBookingsCount(hostId),
      db.getCompletedBookingsCount(hostId)
    ])
    return {
      activeServices: a.count || 0,
      allServices: totalServices.count || 0,
      totalBookings: b.count || 0,
      monthlyRevenue: c.revenue || 0,
      rating: d.rating || 0,
      upcomingBookings: e.count || 0,
      completedBookings: f.count || 0,
      error: a.error || b.error || c.error || d.error || null
    }
  }
}
