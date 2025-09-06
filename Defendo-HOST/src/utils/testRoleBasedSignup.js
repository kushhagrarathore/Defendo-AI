// Test role-based signup functionality
import { auth } from '../lib/supabase'

export const testRoleBasedSignup = async () => {
  console.log('🧪 Testing Role-Based Signup...')
  
  const testData = {
    email: `role-test-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'Role Test User',
    phone: '1234567890',
    companyName: 'Test Security Co',
    address: '123 Test Street'
  }
  
  try {
    console.log('📝 Signing up with role: host...')
    const result = await auth.signUpHost(
      testData.email,
      testData.password,
      testData.fullName,
      testData.phone,
      testData.companyName,
      testData.address
    )
    
    if (result.error) {
      console.error('❌ Signup failed:', result.error)
      return false
    }
    
    console.log('✅ Signup successful!')
    console.log('📊 User data:', result.data)
    console.log('🔍 Check host_profiles table in Supabase to verify data was saved there')
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

export const testRegularSignup = async () => {
  console.log('🧪 Testing Regular Signup (should go to profiles)...')
  
  const testData = {
    email: `regular-test-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'Regular Test User',
    phone: '1234567890'
  }
  
  try {
    console.log('📝 Signing up without role...')
    const result = await auth.signUp(
      testData.email,
      testData.password,
      {
        full_name: testData.fullName,
        phone: testData.phone
      }
    )
    
    if (result.error) {
      console.error('❌ Signup failed:', result.error)
      return false
    }
    
    console.log('✅ Signup successful!')
    console.log('📊 User data:', result.data)
    console.log('🔍 Check profiles table in Supabase to verify data was saved there')
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}
