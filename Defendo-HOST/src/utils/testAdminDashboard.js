// Test Admin Dashboard KYC Fetching
// Run this in browser console to test admin dashboard functionality

import { supabase } from '../lib/supabase';

export const testAdminDashboard = async () => {
  console.log('Testing Admin Dashboard KYC fetching...');
  
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

    // Test 3: Check if host_kyc table exists and has data
    const { data: allKycData, error: allKycError } = await supabase
      .from('host_kyc')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (allKycError) {
      console.error('❌ Error fetching all KYC data:', allKycError);
      return;
    }
    console.log('✅ All KYC records:', allKycData);

    // Test 4: Check filtered KYC data (pending/submitted)
    const { data: filteredKycData, error: filteredKycError } = await supabase
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
    
    if (filteredKycError) {
      console.error('❌ Error fetching filtered KYC data:', filteredKycError);
      return;
    }
    console.log('✅ Filtered KYC records:', filteredKycData);

    // Test 5: Check storage bucket access
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

    // Test 6: Check if there are files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('host-kyc-documents')
      .list('', { limit: 10 });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
      return;
    }
    console.log('✅ Files in bucket:', files);

    // Test 7: Test signed URL creation for each KYC record
    if (filteredKycData && filteredKycData.length > 0) {
      console.log('Testing signed URL creation...');
      for (const req of filteredKycData) {
        console.log(`Testing signed URL for ${req.id}:`, req.document_url);
        
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('host-kyc-documents')
          .createSignedUrl(req.document_url, 300);
        
        if (signedUrlError) {
          console.error(`❌ Error creating signed URL for ${req.id}:`, signedUrlError);
        } else {
          console.log(`✅ Signed URL created for ${req.id}:`, signedUrlData?.signedUrl);
        }
      }
    }

    console.log('🎉 Admin Dashboard test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Usage: Call testAdminDashboard() in browser console
window.testAdminDashboard = testAdminDashboard;





















