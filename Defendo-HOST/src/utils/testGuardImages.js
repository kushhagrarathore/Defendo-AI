// Test utility for debugging guard images upload and display
import { supabase } from '../lib/supabase'

export const testGuardBucketAccess = async () => {
  try {
    console.log('🔍 Testing guard_services bucket access...')
    
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return false
    }
    
    const guardBucket = buckets.find(bucket => bucket.name === 'guard_services')
    
    if (!guardBucket) {
      console.error('❌ guard_services bucket not found!')
      console.log('Available buckets:', buckets.map(b => b.name))
      return false
    }
    
    console.log('✅ guard_services bucket found:', guardBucket)
    
    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('guard_services')
      .list('', { limit: 10 })
    
    if (filesError) {
      console.error('❌ Error listing files in guard_services:', filesError)
      return false
    }
    
    console.log('✅ Files in guard_services bucket:', files)
    
    return true
  } catch (err) {
    console.error('❌ Exception testing guard bucket:', err)
    return false
  }
}

export const testImageUpload = async (hostId, testFile) => {
  try {
    console.log('🔍 Testing image upload to guard_services...')
    
    const fileName = `test-${Date.now()}.jpg`
    const filePath = `${hostId}/test/${fileName}`
    
    const { data, error } = await supabase.storage
      .from('guard_services')
      .upload(filePath, testFile)
    
    if (error) {
      console.error('❌ Error uploading test image:', error)
      return null
    }
    
    console.log('✅ Test image uploaded:', data)
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('guard_services')
      .getPublicUrl(filePath)
    
    console.log('✅ Test image public URL:', publicUrl)
    
    return publicUrl
  } catch (err) {
    console.error('❌ Exception testing image upload:', err)
    return null
  }
}

export const validateSubcategoryImages = (subcategories) => {
  console.log('🔍 Validating subcategory images...')
  
  let totalImages = 0
  let missingImages = 0
  
  Object.entries(subcategories).forEach(([key, subcat]) => {
    console.log(`📋 Subcategory: ${subcat.label}`)
    
    if (subcat.images && subcat.images.length > 0) {
      console.log(`✅ Has ${subcat.images.length} images:`, subcat.images)
      totalImages += subcat.images.length
    } else {
      console.log(`⚠️ No images for ${subcat.label}`)
      missingImages++
    }
  })
  
  console.log(`📊 Summary: ${totalImages} total images, ${missingImages} subcategories without images`)
  
  return {
    totalImages,
    missingImages,
    hasImages: totalImages > 0
  }
}

export const debugImageURLs = (images) => {
  if (!images || images.length === 0) {
    console.log('❌ No images provided for debugging')
    return
  }
  
  console.log('🔍 Debugging image URLs:')
  images.forEach((url, index) => {
    console.log(`📸 Image ${index + 1}: ${url}`)
    
    if (url.includes('guard_services')) {
      console.log('✅ URL contains guard_services bucket')
    } else {
      console.log('⚠️ URL does not contain guard_services bucket')
    }
    
    if (url.startsWith('https://')) {
      console.log('✅ Valid HTTPS URL')
    } else {
      console.log('❌ Invalid URL format')
    }
  })
}


















