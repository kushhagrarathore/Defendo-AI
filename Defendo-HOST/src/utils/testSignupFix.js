// Test script to verify the fixed signup process
// Run this in browser console or as a test file

import { auth } from '../lib/supabase.js'

export const testSignupFix = async () => {
  console.log('🧪 Testing fixed signup process...')
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testData = {
    fullName: 'Test Host',
    phone: '+1234567890',
    companyName: 'Test Security Co',
    address: '123 Test Street'
  }

  try {
    console.log('📝 Attempting host signup...')
    const result = await auth.signUpHost(
      testEmail,
      testPassword,
      testData.fullName,
      testData.phone,
      testData.companyName,
      testData.address
    )

    if (result.error) {
      console.error('❌ Signup failed:', result.error)
      return { success: false, error: result.error }
    }

    console.log('✅ Signup successful!')
    console.log('📊 Result:', result.data)

    // Test login to verify profile was created
    console.log('🔐 Testing login...')
    const loginResult = await auth.loginHost(testEmail, testPassword)
    
    if (loginResult.error) {
      console.error('❌ Login failed:', loginResult.error)
      return { success: false, error: loginResult.error }
    }

    console.log('✅ Login successful!')
    console.log('👤 Host profile:', loginResult.data.host)

    return { success: true, data: { signup: result.data, login: loginResult.data } }

  } catch (error) {
    console.error('❌ Test failed with exception:', error)
    return { success: false, error: error.message }
  }
}

// Run the test
export const runSignupTest = async () => {
  const result = await testSignupFix()
  
  if (result.success) {
    console.log('🎉 All tests passed! Signup process is working correctly.')
  } else {
    console.log('💥 Tests failed. Check the errors above.')
  }
  
  return result
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  window.runSignupTest = runSignupTest
  console.log('🚀 Test ready! Run runSignupTest() in console to test signup.')
}
