// Quick test to debug the hanging login issue
// Run this in the browser console

import { supabase } from '../lib/supabase.js'

export const quickLoginTest = async () => {
  console.log('🚀 Quick login test starting...')
  
  try {
    console.log('Step 1: Testing Supabase auth call...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@yopmail.com',
      password: 'demo123' // Try common demo password
    })
    
    console.log('Step 2: Auth response received')
    console.log('Data:', data)
    console.log('Error:', error)
    
    if (error) {
      console.error('❌ Login failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Login successful!')
    console.log('User:', data.user)
    
    // Sign out after test
    await supabase.auth.signOut()
    console.log('Signed out after test')
    
    return { success: true, data }
    
  } catch (err) {
    console.error('❌ Exception during login test:', err)
    return { success: false, error: err.message }
  }
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  window.quickLoginTest = quickLoginTest
  console.log('🚀 Quick test ready! Run quickLoginTest() in console.')
}
