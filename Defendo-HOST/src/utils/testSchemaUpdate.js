// Test schema update functionality
import { supabase } from '../lib/supabase'

export const testSchemaUpdate = async () => {
  console.log('🧪 Testing Schema Update...')
  
  const testEmail = `schema-test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'
  const testData = {
    role: "host",
    full_name: 'Schema Test User',
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
    
    // Step 2: Wait for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 3000))
    
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
      
      // Step 4: Test creating a booking (to test foreign key relationships)
      console.log('🧪 Testing booking creation...')
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          host_id: signupData.user.id,
          service_type: 'securityGuard',
          date: new Date().toISOString(),
          duration: 8,
          location: 'Test Location',
          price: 1000
        })
        .select()
      
      if (bookingError) {
        console.error('❌ Booking creation failed:', bookingError)
        return false
      }
      
      console.log('✅ Booking created successfully:', bookingData)
      return true
    } else {
      console.error('❌ FAILED: No data found in host_profiles table!')
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

export const checkTableStructure = async () => {
  console.log('🔍 Checking table structure...')
  
  try {
    // Check if host_profiles table exists and has data
    const { data: hostProfiles, error: hostError } = await supabase
      .from('host_profiles')
      .select('id, email, full_name, company_name')
      .limit(3)
    
    if (hostError) {
      console.error('❌ Host profiles table check failed:', hostError)
    } else {
      console.log('📊 Host profiles table data:', hostProfiles)
    }
    
    // Check if bookings table has correct structure
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, host_id, service_type, status')
      .limit(3)
    
    if (bookingsError) {
      console.error('❌ Bookings table check failed:', bookingsError)
    } else {
      console.log('📊 Bookings table data:', bookings)
    }
    
  } catch (error) {
    console.error('❌ Structure check failed:', error)
  }
}
