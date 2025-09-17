// Image upload utilities for service images
import { supabase } from '../lib/supabase'

export const uploadServiceImages = async (serviceId, hostId, files) => {
  try {
    console.log('Uploading images for service:', serviceId, 'host:', hostId)
    
    if (!files || files.length === 0) {
      return []
    }

    const uploadedUrls = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image`)
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB`)
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${hostId}/${serviceId}/${fileName}`

      console.log('Uploading file:', filePath)

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('service-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Failed to upload ${file.name}: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
      console.log('Uploaded successfully:', publicUrl)
    }

    return uploadedUrls
  } catch (err) {
    console.error('Error uploading images:', err)
    throw err
  }
}

export const deleteServiceImage = async (imageUrl) => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(-3).join('/') // Get last 3 parts: hostId/serviceId/filename

    console.log('Deleting image:', filePath)

    const { error } = await supabase.storage
      .from('service-images')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      throw new Error(`Failed to delete image: ${error.message}`)
    }

    console.log('Image deleted successfully')
    return true
  } catch (err) {
    console.error('Error deleting image:', err)
    throw err
  }
}

export const updateServiceImages = async (serviceId, imageUrls) => {
  try {
    console.log('Updating service images:', serviceId, imageUrls)

    const { data, error } = await supabase
      .from('host_services')
      .update({ images: imageUrls })
      .eq('id', serviceId)
      .select()

    if (error) {
      console.error('Update error:', error)
      throw new Error(`Failed to update service images: ${error.message}`)
    }

    console.log('Service images updated successfully:', data)
    return data
  } catch (err) {
    console.error('Error updating service images:', err)
    throw err
  }
}

// Validate image files
export const validateImageFiles = (files) => {
  const errors = []
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  for (let file of files) {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`${file.name}: Only JPEG, PNG, WebP, and GIF images are allowed`)
    }
    
    if (file.size > maxSize) {
      errors.push(`${file.name}: File size must be less than 5MB`)
    }
  }

  return errors
}
