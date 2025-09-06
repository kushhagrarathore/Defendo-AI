// Test user type selection functionality
import { auth } from '../lib/supabase'

export const testHostSignup = async () => {
  console.log('🧪 Testing Host Signup...')
  
  const testData = {
    email: `host-test-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'Test Host User',
    phone: '1234567890',
    companyName: 'Test Security Co',
    address: '123 Test Street'
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
      console.error('❌ Host signup failed:', result.error)
      return false
    }
    
    console.log('✅ Host signup successful!')
    console.log('📊 User data:', result.data)
    console.log('🔍 Check host_profiles table in Supabase')
    
    return true
  } catch (error) {
    console.error('❌ Host signup test failed:', error)
    return false
  }
}

export const testUserSignup = async () => {
  console.log('🧪 Testing User Signup...')
  
  const testData = {
    email: `user-test-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'Test Regular User',
    phone: '1234567890'
  }
  
  try {
    const result = await auth.signUp(
      testData.email,
      testData.password,
      {
        role: "user",
        full_name: testData.fullName,
        phone: testData.phone
      }
    )
    
    if (result.error) {
      console.error('❌ User signup failed:', result.error)
      return false
    }
    
    console.log('✅ User signup successful!')
    console.log('📊 User data:', result.data)
    console.log('🔍 Check profiles table in Supabase')
    
    return true
  } catch (error) {
    console.error('❌ User signup test failed:', error)
    return false
  }
}

export const runUserTypeTests = async () => {
  console.log('🚀 Running User Type Selection Tests...')
  
  console.log('\n--- Testing Host Signup ---')
  const hostResult = await testHostSignup()
  
  console.log('\n--- Testing User Signup ---')
  const userResult = await testUserSignup()
  
  console.log('\n--- Test Results ---')
  console.log(`Host Signup: ${hostResult ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`User Signup: ${userResult ? '✅ PASS' : '❌ FAIL'}`)
  
  return { hostResult, userResult }
}
