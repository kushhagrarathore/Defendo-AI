// Test script to debug login issues
// Run this in browser console or as a test file

import { supabase } from '../lib/supabase.js'

export const testLogin = async (email, password) => {
  console.log('🧪 Testing login functionality...')
  
  try {
    // Test 1: Direct Supabase auth
    console.log('📝 Test 1: Direct Supabase auth')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError) {
      console.error('❌ Direct auth failed:', authError.message)
      return { success: false, error: authError.message }
    }
    
    console.log('✅ Direct auth successful:', authData.user)
    
    // Test 2: Check host profile
    console.log('📝 Test 2: Checking host profile')
    const { data: hostProfile, error: hostError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (hostError) {
      console.error('❌ Host profile fetch failed:', hostError.message)
      return { success: false, error: hostError.message }
    }
    
    console.log('✅ Host profile found:', hostProfile)
    
    // Test 3: Sign out
    console.log('📝 Test 3: Signing out')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError.message)
    } else {
      console.log('✅ Sign out successful')
    }
    
    return { success: true, data: { auth: authData, host: hostProfile } }
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error)
    return { success: false, error: error.message }
  }
}

// Test with sample credentials
export const runLoginTest = async () => {
  console.log('🚀 Running login test with sample credentials...')
  
  // You can replace these with actual test credentials
  const testEmail = 'test@example.com'
  const testPassword = 'testpassword123'
  
  const result = await testLogin(testEmail, testPassword)
  
  if (result.success) {
    console.log('🎉 Login test passed!')
  } else {
    console.log('💥 Login test failed. Check the errors above.')
  }
  
  return result
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  window.testLogin = testLogin
  window.runLoginTest = runLoginTest
  console.log('🚀 Login test ready! Run runLoginTest() in console to test login.')
}
