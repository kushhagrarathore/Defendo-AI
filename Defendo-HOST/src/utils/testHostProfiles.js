// Test utility for host profiles functionality
import { auth, db } from '../lib/supabase'

export const testHostSignup = async () => {
  console.log('🧪 Testing Host Signup...')
  
  const testData = {
    email: `test-host-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'Test Host User',
    phone: '1234567890',
    companyName: 'Test Security Co',
    address: '123 Test Street, Test City'
  }
  
  try {
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
    
    console.log('✅ Signup successful:', result.data)
    return true
  } catch (error) {
    console.error('❌ Signup error:', error)
    return false
  }
}

export const testHostLogin = async (email, password) => {
  console.log('🧪 Testing Host Login...')
  
  try {
    const result = await auth.loginHost(email, password)
    
    if (result.error) {
      console.error('❌ Login failed:', result.error)
      return false
    }
    
    console.log('✅ Login successful:', result.data)
    console.log('📊 Host profile:', result.data.host)
    return true
  } catch (error) {
    console.error('❌ Login error:', error)
    return false
  }
}

export const testHostProfileFetch = async (hostId) => {
  console.log('🧪 Testing Host Profile Fetch...')
  
  try {
    const result = await db.getHostProfile(hostId)
    
    if (result.error) {
      console.error('❌ Profile fetch failed:', result.error)
      return false
    }
    
    console.log('✅ Profile fetch successful:', result.data)
    return true
  } catch (error) {
    console.error('❌ Profile fetch error:', error)
    return false
  }
}

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Running Host Profile Tests...')
  
  // Test 1: Signup
  const signupResult = await testHostSignup()
  if (!signupResult) return false
  
  // Test 2: Login (you'll need to provide actual credentials)
  // const loginResult = await testHostLogin('your-email@example.com', 'your-password')
  
  console.log('✅ All tests completed!')
  return true
}
