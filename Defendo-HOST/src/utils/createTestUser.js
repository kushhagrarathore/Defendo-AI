// Utility to create a test user for login testing
// Run this in browser console to create a test user

import { supabase } from '../lib/supabase.js'

export const createTestUser = async () => {
  console.log('🧪 Creating test user...')
  
  const testUser = {
    email: 'photo@yopmail.com',
    password: 'test123456',
    fullName: 'Photo User',
    companyName: 'Test Security Co',
    phone: '+1234567890',
    address: '123 Test Street'
  }
  
  try {
    // Step 1: Sign up the user
    console.log('📝 Step 1: Signing up user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          role: "host",
          full_name: testUser.fullName,
          phone: testUser.phone,
          company_name: testUser.companyName,
          address: testUser.address,
        },
      },
    })

    if (authError) {
      console.error('❌ Signup failed:', authError.message)
      return { success: false, error: authError.message }
    }

    console.log('✅ User created successfully:', authData.user)

    // Step 2: Check if host profile was created by trigger
    console.log('📝 Step 2: Checking host profile...')
    const { data: hostProfile, error: hostError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (hostError) {
      console.error('❌ Host profile not found:', hostError.message)
      console.log('📝 Creating host profile manually...')
      
      // Create host profile manually
      const { data: newProfile, error: createError } = await supabase
        .from('host_profiles')
        .insert({
          id: authData.user.id,
          email: testUser.email,
          full_name: testUser.fullName,
          company_name: testUser.companyName,
          phone: testUser.phone,
          address: testUser.address,
          services_offered: []
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Failed to create host profile:', createError.message)
        return { success: false, error: createError.message }
      }

      console.log('✅ Host profile created manually:', newProfile)
    } else {
      console.log('✅ Host profile found:', hostProfile)
    }

    // Step 3: Sign out
    await supabase.auth.signOut()
    console.log('✅ Signed out after creation')

    return { 
      success: true, 
      data: { 
        email: testUser.email, 
        password: testUser.password,
        user: authData.user 
      } 
    }

  } catch (error) {
    console.error('❌ Exception during user creation:', error)
    return { success: false, error: error.message }
  }
}

// Test login with the created user
export const testLoginWithCreatedUser = async () => {
  console.log('🧪 Testing login with created user...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'photo@yopmail.com',
      password: 'test123456'
    })

    if (error) {
      console.error('❌ Login test failed:', error.message)
      return { success: false, error: error.message }
    }

    console.log('✅ Login test successful:', data.user)
    
    // Sign out after test
    await supabase.auth.signOut()
    console.log('✅ Signed out after test')
    
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Login test failed with exception:', error)
    return { success: false, error: error.message }
  }
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  window.createTestUser = createTestUser
  window.testLoginWithCreatedUser = testLoginWithCreatedUser
  console.log('🚀 Test user creation ready! Run createTestUser() in console to create a test user.')
}
