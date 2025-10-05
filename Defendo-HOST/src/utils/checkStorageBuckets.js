// Check what storage buckets exist
import { supabase } from '../lib/supabase';

export const checkStorageBuckets = async () => {
  console.log('🔍 Checking storage buckets...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error);
      return;
    }
    
    console.log('📦 Available buckets:', buckets);
    
    // Check if host-kyc-documents exists
    const kycBucket = buckets?.find(bucket => bucket.name === 'host-kyc-documents');
    
    if (kycBucket) {
      console.log('✅ host-kyc-documents bucket exists:', kycBucket);
    } else {
      console.log('❌ host-kyc-documents bucket not found');
      console.log('📝 Available bucket names:', buckets?.map(b => b.name));
    }
    
    // Try to create the bucket if it doesn't exist
    if (!kycBucket) {
      console.log('🔧 Attempting to create host-kyc-documents bucket...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('host-kyc-documents', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
      } else {
        console.log('✅ Bucket created successfully:', newBucket);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking buckets:', error);
  }
};

// Usage: Call checkStorageBuckets() in browser console
window.checkStorageBuckets = checkStorageBuckets;


















