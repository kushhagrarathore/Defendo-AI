// Test database trigger functionality
import { supabase } from '../lib/supabase'

export const testDatabaseTrigger = async () => {
  console.log('🧪 Testing Database Trigger...')
  
  // Test data
  const testEmail = `trigger-test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'
  const testData = {
    full_name: 'Trigger Test User',
    company_name: 'Test Security Co',
    phone: '1234567890',
    address: '123 Test Street'
  }
  
  try {
    // Step 1: Sign up a new user
    console.log('📝 Creating new user...')
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: testData
      }
    })
    
    if (signupError) {
      console.error('❌ Signup failed:', signupError)
      return false
    }
    
    console.log('✅ Signup successful:', signupData.user?.id)
    
    // Step 2: Check if host profile was created
    console.log('🔍 Checking host_profiles table...')
    const { data: hostProfiles, error: hostError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('id', signupData.user.id)
    
    if (hostError) {
      console.error('❌ Host profile check failed:', hostError)
      return false
    }
    
    if (hostProfiles && hostProfiles.length > 0) {
      console.log('✅ Host profile created successfully:', hostProfiles[0])
      return true
    } else {
      console.error('❌ No host profile found!')
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

export const checkExistingData = async () => {
  console.log('🔍 Checking existing data...')
  
  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Profiles check failed:', profilesError)
    } else {
      console.log('📊 Profiles table:', profiles)
    }
    
    // Check host_profiles table
    const { data: hostProfiles, error: hostError } = await supabase
      .from('host_profiles')
      .select('id, email, full_name, company_name')
      .limit(5)
    
    if (hostError) {
      console.error('❌ Host profiles check failed:', hostError)
    } else {
      console.log('📊 Host profiles table:', hostProfiles)
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}
