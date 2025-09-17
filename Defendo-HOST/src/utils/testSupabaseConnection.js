// Test Supabase connection and configuration
// Run this in browser console to debug connection issues

import { supabase } from '../lib/supabase.js'

export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    // Test 1: Check Supabase client
    console.log('📝 Test 1: Checking Supabase client')
    console.log('Supabase URL:', supabase.supabaseUrl)
    console.log('Supabase Key:', supabase.supabaseKey ? 'Present' : 'Missing')
    
    // Test 2: Test basic connection
    console.log('📝 Test 2: Testing basic connection')
    const { data, error } = await supabase.from('host_profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Connection test successful')
    
    // Test 3: Check auth service
    console.log('📝 Test 3: Testing auth service')
    const { data: session } = await supabase.auth.getSession()
    console.log('Current session:', session)
    
    return { success: true, data: { connection: 'OK', session } }
    
  } catch (error) {
    console.error('❌ Connection test failed with exception:', error)
    return { success: false, error: error.message }
  }
}

// Test with specific credentials
export const testLoginWithCredentials = async (email, password) => {
  console.log('🧪 Testing login with credentials...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Login test failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Login test successful:', data.user)
    
    // Sign out after test
    await supabase.auth.signOut()
    
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Login test failed with exception:', error)
    return { success: false, error: error.message }
  }
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection
  window.testLoginWithCredentials = testLoginWithCredentials
  console.log('🚀 Supabase test ready! Run testSupabaseConnection() in console to test connection.')
}
