// Test if a user exists in the database
// Run this in browser console to check user existence

import { supabase } from '../lib/supabase.js'

export const testUserExists = async (email) => {
  console.log('🧪 Testing if user exists:', email)
  
  try {
    // Check if user exists in auth.users (this is internal, so we'll check host_profiles instead)
    console.log('📝 Checking host_profiles table...')
    const { data: hostProfile, error: hostError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('email', email)
      .single()
    
    if (hostError) {
      console.error('❌ User not found in host_profiles:', hostError.message)
      return { success: false, error: hostError.message }
    }
    
    console.log('✅ User found in host_profiles:', hostProfile)
    return { success: true, data: hostProfile }
    
  } catch (error) {
    console.error('❌ Error checking user existence:', error)
    return { success: false, error: error.message }
  }
}

// Test with the demo email
export const testDemoUser = async () => {
  console.log('🚀 Testing demo user existence...')
  return await testUserExists('demo@yopmail.com')
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  window.testUserExists = testUserExists
  window.testDemoUser = testDemoUser
  console.log('🚀 User test ready! Run testDemoUser() in console to check if demo user exists.')
}
