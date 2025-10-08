// Test Super Admin Storage Access
// Run this in browser console to test super admin storage permissions

import { supabase } from '../lib/supabase';

export const testSuperAdminStorage = async () => {
  console.log('Testing Super Admin Storage Access...');
  
  try {
    // Test 1: Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      return;
    }
    console.log('✅ User authenticated:', user.id, user.email);

    // Test 2: Check if user is a super admin
    const { data: adminData, error: adminError } = await supabase
      .from('super_admins')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (adminError) {
      console.error('❌ User is not a super admin:', adminError);
      return;
    }
    console.log('✅ User is super admin:', adminData);

    // Test 3: Check storage bucket access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    const kycBucket = buckets.find(bucket => bucket.id === 'host-kyc-documents');
    if (!kycBucket) {
      console.error('❌ host-kyc-documents bucket not found');
      return;
    }
    console.log('✅ KYC bucket exists:', kycBucket);

    // Test 4: List all files in the bucket (super admin should be able to do this)
    const { data: allFiles, error: allFilesError } = await supabase.storage
      .from('host-kyc-documents')
      .list('', { limit: 100 });
    
    if (allFilesError) {
      console.error('❌ Error listing all files (super admin should have access):', allFilesError);
      return;
    }
    console.log('✅ Super admin can list all files:', allFiles);

    // Test 5: Test signed URL creation for any file
    if (allFiles && allFiles.length > 0) {
      const testFile = allFiles[0];
      console.log('Testing signed URL creation for file:', testFile.name);
      
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('host-kyc-documents')
        .createSignedUrl(testFile.name, 300);
      
      if (signedUrlError) {
        console.error('❌ Error creating signed URL:', signedUrlError);
      } else {
        console.log('✅ Signed URL created successfully:', signedUrlData?.signedUrl);
        
        // Test 6: Try to fetch the file
        try {
          const response = await fetch(signedUrlData.signedUrl);
          if (response.ok) {
            console.log('✅ Successfully fetched file content');
          } else {
            console.error('❌ Failed to fetch file content:', response.status, response.statusText);
          }
        } catch (fetchError) {
          console.error('❌ Error fetching file:', fetchError);
        }
      }
    } else {
      console.log('ℹ️ No files found in bucket to test with');
    }

    // Test 7: Test KYC data fetching
    const { data: kycData, error: kycError } = await supabase
      .from('host_kyc')
      .select(`
        *,
        host_profiles!inner(
          id,
          full_name,
          email,
          company_name
        )
      `)
      .in('status', ['pending', 'submitted'])
      .order('submitted_at', { ascending: false });
    
    if (kycError) {
      console.error('❌ Error fetching KYC data:', kycError);
      return;
    }
    console.log('✅ KYC data fetched:', kycData);

    // Test 8: Test signed URL creation for KYC documents
    if (kycData && kycData.length > 0) {
      console.log('Testing signed URL creation for KYC documents...');
      for (const kyc of kycData) {
        console.log(`Testing signed URL for ${kyc.id}:`, kyc.document_url);
        
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('host-kyc-documents')
          .createSignedUrl(kyc.document_url, 300);
        
        if (signedUrlError) {
          console.error(`❌ Error creating signed URL for ${kyc.id}:`, signedUrlError);
        } else {
          console.log(`✅ Signed URL created for ${kyc.id}:`, signedUrlData?.signedUrl);
        }
      }
    }

    console.log('🎉 Super Admin Storage Access test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Usage: Call testSuperAdminStorage() in browser console
window.testSuperAdminStorage = testSuperAdminStorage;
























