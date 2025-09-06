// Test if the database trigger is working correctly
import { supabase } from '../lib/supabase'

export const testTriggerFix = async () => {
  console.log('🧪 Testing Database Trigger Fix...')
  
  const testEmail = `trigger-test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'
  const testData = {
    role: "host",
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
    
    console.log('✅ Signup successful!')
    console.log('👤 User ID:', signupData.user?.id)
    
    // Step 2: Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Step 3: Check host_profiles table
    console.log('🔍 Checking host_profiles table...')
    const { data: hostProfiles, error: hostError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('id', signupData.user.id)
    
    if (hostError) {
      console.error('❌ Host profiles check failed:', hostError)
      return false
    }
    
    if (hostProfiles && hostProfiles.length > 0) {
      console.log('✅ SUCCESS: Data found in host_profiles table!')
      console.log('📊 Host profile data:', hostProfiles[0])
      return true
    } else {
      console.error('❌ FAILED: No data found in host_profiles table!')
      
      // Check profiles table as fallback
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signupData.user.id)
      
      if (profiles && profiles.length > 0) {
        console.log('⚠️ Data found in profiles table instead:', profiles[0])
      }
      
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

export const checkCurrentData = async () => {
  console.log('🔍 Checking current data in both tables...')
  
  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Profiles check failed:', profilesError)
    } else {
      console.log('📊 Recent profiles:', profiles)
    }
    
    // Check host_profiles table
    const { data: hostProfiles, error: hostError } = await supabase
      .from('host_profiles')
      .select('id, email, full_name, company_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (hostError) {
      console.error('❌ Host profiles check failed:', hostError)
    } else {
      console.log('📊 Recent host_profiles:', hostProfiles)
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}
