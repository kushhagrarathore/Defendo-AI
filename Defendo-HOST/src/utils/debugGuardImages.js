// Debug script for guard images uploading issues
import { supabase } from '../lib/supabase'
import { uploadGuardTypeImages } from './imageUpload'

export const debugGuardImageUpload = async (userId, serviceId) => {
  console.log('🔍 Starting comprehensive guard images debug...')
  
  // 1. Test bucket access
  console.log('\n1️⃣ Testing guard_services bucket access...')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Bucket list error:', error)
      return false
    }
    
    const guardBucket = buckets.find(b => b.name === 'guard_services')
    if (!guardBucket) {
      console.error('❌ guard_services bucket NOT FOUND!')
      console.log('Available buckets:', buckets.map(b => b.name))
      return false
    }
    
    console.log('✅ guard_services bucket found:', guardBucket)
  } catch (err) {
    console.error('❌ Exception checking buckets:', err)
    return false
  }

  // 2. Test direct upload
  console.log('\n2️⃣ Testing direct upload to guard_services...')
  try {
    // Create a test file (simple text file)
    const testContent = 'This is a test file for guard_services bucket'
    const testFile = new File([testContent], 'test-file.txt', { type: 'text/plain' })
    const testPath = `${userId}/${serviceId}/test-subcategory/test-file.txt`
    
    const { data, error } = await supabase.storage
      .from('guard_services')
      .upload(testPath, testFile)
    
    if (error) {
      console.error('❌ Direct upload failed:', error)
      console.log('❌ Error details:', JSON.stringify(error, null, 2))
      return false
    }
    
    console.log('✅ Direct upload successful:', data)
    
    // Clean up test file
    await supabase.storage
      .from('guard_services')
      .remove([testPath])
    console.log('🧹 Test file cleaned up')
    
  } catch (err) {
    console.error('❌ Exception during direct upload test:', err)
    return false
  }

  // 3. Test image upload function
  console.log('\n3️⃣ Testing uploadGuardTypeImages function...')
  try {
    // Create a test image file (small base64 image)
    const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    const response = await fetch(imageBase64)
    const blob = await response.blob()
    const testImageFile = new File([blob], 'test-image.png', { type: 'image/png' })
    
    const urls = await uploadGuardTypeImages(serviceId, userId, 'test-guard', [testImageFile])
    
    if (urls && urls.length > 0) {
      console.log('✅ uploadGuardTypeImages function works!')
      console.log('✅ Generated URLs:', urls)
      
      // Clean up test images
      for (const url of urls) {
        try {
          const urlObj = new URL(url)
          const pathParts = urlObj.pathname.split('/')
          const filePath = pathParts.slice(-4).join('/') // Get last 4 parts
          await supabase.storage.from('guard_services').remove([filePath])
        } catch (cleanErr) {
          console.warn('⚠️ Could not clean up test image:', cleanErr)
        }
      }
      
      return true
    } else {
      console.error('❌ uploadGuardTypeImages returned empty results')
      return false
    }
    
  } catch (err) {
    console.error('❌ Exception during image upload function test:', err)
    return false
  }
}

export const checkActualGuardImages = async (userId, serviceId) => {
  console.log('\n🔍 Checking actual guard images in database...')
  
  try {
    // Get the service from database
    const { data: service, error } = await supabase
      .from('host_services')
      .select('id, service_name, sub_category')
      .eq('id', serviceId)
      .single()
    
    if (error) {
      console.error('❌ Error fetching service:', error)
      return
    }
    
    console.log('📋 Service:', service.service_name)
    console.log('📋 Subcategory JSON:', service.sub_category)
    
    const subcategories = JSON.parse(service.sub_category || '{}')
    console.log('📋 Parsed subcategories:', JSON.stringify(subcategories, null, 2))
    
    // Check each subcategory for images
    Object.entries(subcategories).forEach(([key, subcat]) => {
      console.log(`\n📸 Subcategory "${key}" (${subcat.label}):`)
      if (subcat.images && subcat.images.length > 0) {
        console.log('✅ Has images:', subcat.images)
      } else {
        console.log('❌ No images found')
      }
    })
    
  } catch (err) {
    console.error('❌ Exception checking actual guard images:', err)
  }
}

export const diagnoseAddServiceFlow = (serviceType, subcategories) => {
  console.log('\n🎯 Diagnosing Add Service flow...')
  console.log('Service Type:', serviceType)
  console.log('Subcategories state:', JSON.stringify(subcategories, null, 2))
  
  let issues = []
  
  if (serviceType !== 'guards') {
    issues.push('❌ Service type is not "guards" - guard image upload only works for guard services')
  }
  
  const selectedSubcats = Object.entries(subcategories).filter(([key, val]) => val?.selected)
  if (selectedSubcats.length === 0) {
    issues.push('❌ No subcategories selected')
  }
  
  const subcatsWithImages = selectedSubcats.filter(([key, val]) => val?.images && val.images.length > 0)
  if (subcatsWithImages.length === 0) {
    issues.push('❌ No subcategories have images uploaded')
  }
  
  console.log('\n📊 Diagnosis Results:')
  if (issues.length === 0) {
    console.log('✅ All checks passed - images should be uploading')
  } else {
    console.log('❌ Issues found:')
    issues.forEach(issue => console.log(issue))
  }
  
  return issues.length === 0
}










