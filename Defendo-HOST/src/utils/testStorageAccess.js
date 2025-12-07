// Test Storage Access for KYC Documents
// Run this in browser console to test storage access

import { supabase } from '../lib/supabase';

export const testStorageAccess = async () => {
  console.log('Testing storage access...');
  
  try {
    // Test 1: Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('User not authenticated:', userError);
      return;
    }
    console.log('✅ User authenticated:', user.id);

    // Test 2: Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    const kycBucket = buckets.find(bucket => bucket.id === 'host-kyc-documents');
    if (!kycBucket) {
      console.error('❌ host-kyc-documents bucket not found');
      return;
    }
    console.log('✅ KYC bucket exists:', kycBucket);

    // Test 3: Try to list files in user's folder
    const { data: files, error: listError } = await supabase.storage
      .from('host-kyc-documents')
      .list(user.id);
    
    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }
    console.log('✅ Can list files in user folder:', files);

    // Test 4: Try to create a test file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('host-kyc-documents')
      .upload(`${user.id}/test_${Date.now()}.txt`, testFile);
    
    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError);
      return;
    }
    console.log('✅ Test file uploaded:', uploadData);

    // Test 5: Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('host-kyc-documents')
      .remove([uploadData.path]);
    
    if (deleteError) {
      console.error('❌ Error deleting test file:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }

    console.log('🎉 All storage tests passed!');
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
};

// Usage: Call testStorageAccess() in browser console
window.testStorageAccess = testStorageAccess;








































