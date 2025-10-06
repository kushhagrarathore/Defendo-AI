// Debug KYC Data Structure
// Run this in browser console to see what's in the KYC data

import { supabase } from '../lib/supabase';

export const debugKycData = async () => {
  console.log('🔍 Debugging KYC Data Structure...');
  
  try {
    // Get all KYC records
    const { data: allKyc, error: allError } = await supabase
      .from('host_kyc')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error fetching all KYC:', allError);
      return;
    }
    
    console.log('📊 All KYC Records:', allKyc);
    console.log('📊 Total count:', allKyc?.length || 0);
    
    if (allKyc && allKyc.length > 0) {
      // Check statuses
      const statuses = [...new Set(allKyc.map(r => r.status))];
      console.log('📊 Available statuses:', statuses);
      
      // Check host_ids
      const hostIds = [...new Set(allKyc.map(r => r.host_id))];
      console.log('📊 Host IDs in KYC:', hostIds);
      
      // Check document types
      const docTypes = [...new Set(allKyc.map(r => r.document_type))];
      console.log('📊 Document types:', docTypes);
      
      // Check if host_profiles exist for these host_ids
      console.log('🔍 Checking host_profiles for KYC host_ids...');
      const { data: hostProfiles, error: hostError } = await supabase
        .from('host_profiles')
        .select('id, full_name, email, company_name')
        .in('id', hostIds);
      
      if (hostError) {
        console.error('❌ Error fetching host profiles:', hostError);
      } else {
        console.log('📊 Host profiles found:', hostProfiles);
        console.log('📊 Host profile count:', hostProfiles?.length || 0);
        
        // Check which KYC records have matching host profiles
        const kycWithProfiles = allKyc.filter(kyc => 
          hostProfiles?.some(profile => profile.id === kyc.host_id)
        );
        console.log('📊 KYC records with matching host profiles:', kycWithProfiles.length);
        
        const kycWithoutProfiles = allKyc.filter(kyc => 
          !hostProfiles?.some(profile => profile.id === kyc.host_id)
        );
        console.log('📊 KYC records WITHOUT matching host profiles:', kycWithoutProfiles);
      }
      
      // Test different status filters
      console.log('🔍 Testing status filters...');
      const pendingKyc = allKyc.filter(r => r.status === 'pending');
      const submittedKyc = allKyc.filter(r => r.status === 'submitted');
      const approvedKyc = allKyc.filter(r => r.status === 'approved');
      const rejectedKyc = allKyc.filter(r => r.status === 'rejected');
      
      console.log('📊 Pending KYC:', pendingKyc.length);
      console.log('📊 Submitted KYC:', submittedKyc.length);
      console.log('📊 Approved KYC:', approvedKyc.length);
      console.log('📊 Rejected KYC:', rejectedKyc.length);
      
      // Test the actual query that's failing
      console.log('🔍 Testing the failing query...');
      const { data: filteredKyc, error: filteredError } = await supabase
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
        .in('status', ['pending', 'submitted']);
      
      console.log('📊 Filtered KYC (with inner join):', filteredKyc);
      console.log('📊 Filtered KYC error:', filteredError);
      
      // Test without inner join
      const { data: simpleFiltered, error: simpleError } = await supabase
        .from('host_kyc')
        .select('*')
        .in('status', ['pending', 'submitted']);
      
      console.log('📊 Simple filtered KYC (no join):', simpleFiltered);
      console.log('📊 Simple filtered error:', simpleError);
    }
    
    console.log('✅ KYC Data debugging completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// Usage: Call debugKycData() in browser console
window.debugKycData = debugKycData;



















