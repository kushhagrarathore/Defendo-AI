// Test utility for Supabase Storage connection
// Run this in browser console to test storage setup

import { supabase } from '../lib/supabase'

export const testStorageConnection = async () => {
  console.log('🧪 Testing Supabase Storage connection...')
  
  try {
    // Test 1: Check if bucket exists
    console.log('📋 Test 1: Checking if service-images bucket exists...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return false
    }
    
    const serviceImagesBucket = buckets.find(bucket => bucket.id === 'service-images')
    if (!serviceImagesBucket) {
      console.error('❌ service-images bucket not found!')
      console.log('Available buckets:', buckets.map(b => b.id))
      return false
    }
    
    console.log('✅ service-images bucket found:', serviceImagesBucket)
    
    // Test 2: Check bucket permissions
    console.log('📋 Test 2: Checking bucket permissions...')
    if (!serviceImagesBucket.public) {
      console.warn('⚠️ Bucket is not public - images may not be viewable')
    } else {
      console.log('✅ Bucket is public')
    }
    
    // Test 3: Test file upload (with dummy data)
    console.log('📋 Test 3: Testing file upload...')
    const testFileName = `test-${Date.now()}.txt`
    const testContent = 'This is a test file for storage connection'
    const testBlob = new Blob([testContent], { type: 'text/plain' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('service-images')
      .upload(`test/${testFileName}`, testBlob)
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError)
      return false
    }
    
    console.log('✅ Upload test successful:', uploadData)
    
    // Test 4: Test file retrieval
    console.log('📋 Test 4: Testing file retrieval...')
    const { data: { publicUrl } } = supabase.storage
      .from('service-images')
      .getPublicUrl(`test/${testFileName}`)
    
    console.log('✅ Public URL generated:', publicUrl)
    
    // Test 5: Clean up test file
    console.log('📋 Test 5: Cleaning up test file...')
    const { error: deleteError } = await supabase.storage
      .from('service-images')
      .remove([`test/${testFileName}`])
    
    if (deleteError) {
      console.warn('⚠️ Could not delete test file:', deleteError)
    } else {
      console.log('✅ Test file cleaned up')
    }
    
    console.log('🎉 All storage tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Storage test failed with exception:', error)
    return false
  }
}

// Test image upload specifically
export const testImageUpload = async () => {
  console.log('🖼️ Testing image upload...')
  
  try {
    // Create a simple test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(0, 0, 1, 1)
    
    canvas.toBlob(async (blob) => {
      const testFileName = `test-image-${Date.now()}.png`
      const { data, error } = await supabase.storage
        .from('service-images')
        .upload(`test/${testFileName}`, blob)
      
      if (error) {
        console.error('❌ Image upload test failed:', error)
        return
      }
      
      console.log('✅ Image upload test successful:', data)
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(`test/${testFileName}`)
      
      console.log('✅ Image public URL:', publicUrl)
      
      // Clean up
      await supabase.storage
        .from('service-images')
        .remove([`test/${testFileName}`])
      
      console.log('✅ Test image cleaned up')
    }, 'image/png')
    
  } catch (error) {
    console.error('❌ Image upload test failed:', error)
  }
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  window.testStorageConnection = testStorageConnection
  window.testImageUpload = testImageUpload
  console.log('🚀 Storage test utilities ready!')
  console.log('Run testStorageConnection() to test storage setup')
  console.log('Run testImageUpload() to test image upload')
}
