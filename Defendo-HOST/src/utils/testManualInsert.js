// Test manual insert approach for user profiles
import { auth } from '../lib/supabase'

export const testHostSignupManual = async () => {
  console.log('🧪 Testing Host Signup with Manual Insert...')
  
  const testData = {
    email: `host-manual-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'Manual Host Test',
    phone: '1234567890',
    companyName: 'Manual Test Security Co',
    address: '123 Manual Test Street'
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
    console.log('📊 Auth data:', result.data)
    console.log('🔍 Check host_profiles table in Supabase to verify data was inserted')
    
    return true
  } catch (error) {
    console.error('❌ Host signup test failed:', error)
    return false
  }
}

export const testUserSignupManual = async () => {
  console.log('🧪 Testing User Signup with Manual Insert...')
  
  const testData = {
    email: `user-manual-${Date.now()}@example.com`,
    password: 'testpassword123',
    fullName: 'Manual User Test',
    phone: '1234567890'
  }
  
  try {
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
    console.log('📊 Auth data:', result.data)
    console.log('🔍 Check profiles table in Supabase to verify data was inserted')
    
    return true
  } catch (error) {
    console.error('❌ User signup test failed:', error)
    return false
  }
}

export const testLegacySignup = async () => {
  console.log('🧪 Testing Legacy Signup (with role)...')
  
  const hostData = {
    email: `legacy-host-${Date.now()}@example.com`,
    password: 'testpassword123',
    role: 'host',
    full_name: 'Legacy Host Test',
    phone: '1234567890',
    company_name: 'Legacy Test Security Co',
    address: '123 Legacy Test Street'
  }
  
  try {
    const result = await auth.signUp(
      hostData.email,
      hostData.password,
      hostData
    )
    
    if (result.error) {
      console.error('❌ Legacy host signup failed:', result.error)
      return false
    }
    
    console.log('✅ Legacy host signup successful!')
    console.log('📊 Auth data:', result.data)
    console.log('🔍 Check host_profiles table in Supabase')
    
    return true
  } catch (error) {
    console.error('❌ Legacy signup test failed:', error)
    return false
  }
}

export const runManualInsertTests = async () => {
  console.log('🚀 Running Manual Insert Tests...')
  
  console.log('\n--- Testing Host Signup ---')
  const hostResult = await testHostSignupManual()
  
  console.log('\n--- Testing User Signup ---')
  const userResult = await testUserSignupManual()
  
  console.log('\n--- Testing Legacy Signup ---')
  const legacyResult = await testLegacySignup()
  
  console.log('\n--- Test Results ---')
  console.log(`Host Signup: ${hostResult ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`User Signup: ${userResult ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Legacy Signup: ${legacyResult ? '✅ PASS' : '❌ FAIL'}`)
  
  return { hostResult, userResult, legacyResult }
}
