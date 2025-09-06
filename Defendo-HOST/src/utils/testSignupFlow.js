// Test signup flow and redirect behavior
import { auth } from '../lib/supabase'

export const testSignupFlow = async () => {
  console.log('🧪 Testing Signup Flow...')
  
  const testData = {
    email: `flow-test-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'Flow Test User',
    phone: '1234567890',
    companyName: 'Flow Test Security Co',
    address: '123 Flow Test Street'
  }
  
  try {
    console.log('📝 Testing host signup...')
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
    console.log('📊 Result data:', result.data)
    
    // Check if user is automatically logged in
    if (result.data?.user) {
      console.log('✅ User is automatically logged in!')
      console.log('👤 User ID:', result.data.user.id)
      console.log('📧 Email:', result.data.user.email)
      console.log('🎯 Should redirect to dashboard immediately')
    } else {
      console.log('⚠️ User needs email verification')
      console.log('📧 Check email for verification link')
      console.log('🎯 Should redirect to login after verification')
    }
    
    return true
  } catch (error) {
    console.error('❌ Signup flow test failed:', error)
    return false
  }
}

export const testUserSignupFlow = async () => {
  console.log('🧪 Testing User Signup Flow...')
  
  const testData = {
    email: `user-flow-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'User Flow Test',
    phone: '1234567890'
  }
  
  try {
    console.log('📝 Testing user signup...')
    const result = await auth.signUpUser(
      testData.email,
      testData.password,
      testData.fullName,
      testData.phone
    )
    
    if (result.error) {
      console.error('❌ User signup failed:', result.error)
      return false
    }
    
    console.log('✅ User signup successful!')
    console.log('📊 Result data:', result.data)
    
    if (result.data?.user) {
      console.log('✅ User is automatically logged in!')
      console.log('🎯 Should redirect to dashboard immediately')
    } else {
      console.log('⚠️ User needs email verification')
      console.log('🎯 Should redirect to login after verification')
    }
    
    return true
  } catch (error) {
    console.error('❌ User signup flow test failed:', error)
    return false
  }
}

export const runSignupFlowTests = async () => {
  console.log('🚀 Running Signup Flow Tests...')
  
  console.log('\n--- Testing Host Signup Flow ---')
  const hostResult = await testSignupFlow()
  
  console.log('\n--- Testing User Signup Flow ---')
  const userResult = await testUserSignupFlow()
  
  console.log('\n--- Test Results ---')
  console.log(`Host Signup Flow: ${hostResult ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`User Signup Flow: ${userResult ? '✅ PASS' : '❌ FAIL'}`)
  
  return { hostResult, userResult }
}
