import { supabase } from '../lib/supabase.js';

export async function checkStorageBuckets() {
  console.log('🔍 Checking available storage buckets...');
  
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      console.warn('⚠️ Offline detected, skipping bucket checks.');
      return { success: false, error: new Error('offline') };
    }
    // First, check if we can access storage at all
    console.log('🔐 Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return { success: false, error: authError || new Error('no-user') };
    }
    
    console.log('👤 Current user:', user?.id);
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return { success: false, error: bucketsError };
    }
    
    console.log('📦 Available buckets:', buckets);
    console.log('📊 Bucket count:', buckets?.length || 0);
    
    // Check if guard_services bucket exists
    const guardServicesBucket = buckets?.find(bucket => bucket.name === 'guard_services');
    
    if (guardServicesBucket) {
      console.log('✅ guard_services bucket found:', guardServicesBucket);
      
      // Try to list files in the bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('guard_services')
        .list('', { limit: 10 });
      
      if (filesError) {
        console.error('❌ Error listing files in guard_services:', filesError);
      } else {
        console.log('📁 Files in guard_services bucket:', files);
      }
    } else {
      console.log('❌ guard_services bucket NOT found');
      console.log('Available bucket names:', buckets?.map(b => b.name));
      
      // Try to access the bucket directly even if it's not in the list
      console.log('🔍 Attempting direct access to guard_services bucket...');
      const { data: directFiles, error: directError } = await supabase.storage
        .from('guard_services')
        .list('', { limit: 1 });
      
      if (directError) {
        console.error('❌ Direct access failed:', directError);
      } else {
        console.log('✅ Direct access successful! Bucket exists but not in list:', directFiles);
      }
    }
    
    return { 
      success: true, 
      buckets, 
      guardServicesExists: !!guardServicesBucket,
      user: user?.id
    };
    
  } catch (error) {
    console.error('❌ Unexpected error checking buckets:', error);
    return { success: false, error };
  }
}

export async function testGuardServicesUpload() {
  console.log('🧪 Testing guard_services upload...');
  
  try {
    // Create a test file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    const { data, error } = await supabase.storage
      .from('guard_services')
      .upload('test/test.txt', testFile);
    
    if (error) {
      console.error('❌ Upload test failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Upload test successful:', data);
    
    // Clean up test file
    await supabase.storage
      .from('guard_services')
      .remove(['test/test.txt']);
    
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Upload test error:', error);
    return { success: false, error };
  }
}

// Auto-run when imported (guarded by online + user presence)
if (typeof window !== 'undefined') {
  if (navigator.onLine) {
    checkStorageBuckets().then(result => {
      if (result && result.success && result.guardServicesExists) {
        testGuardServicesUpload();
      }
    }).catch(() => {});
  }
}
