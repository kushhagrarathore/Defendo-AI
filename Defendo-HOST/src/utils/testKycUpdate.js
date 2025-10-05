// Test KYC Update Functionality
import { supabase } from '../lib/supabase';

export const testKycUpdate = async () => {
  console.log('🧪 Testing KYC Update Functionality...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Error getting user:', userError);
      return;
    }
    
    console.log('✅ User authenticated:', user.id, user.email);
    
    // Check if user is super admin
    const { data: superAdmin, error: adminError } = await supabase
      .from('super_admins')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (adminError || !superAdmin) {
      console.error('❌ User is not a super admin:', adminError);
      return;
    }
    
    console.log('✅ User is super admin:', superAdmin);
    
    // Get a KYC record to test with
    const { data: kycRecords, error: kycError } = await supabase
      .from('host_kyc')
      .select('*')
      .limit(1);
    
    if (kycError || !kycRecords || kycRecords.length === 0) {
      console.error('❌ No KYC records found:', kycError);
      return;
    }
    
    const testRecord = kycRecords[0];
    console.log('📄 Test KYC record:', testRecord);
    
    // Test status update - only update status and reviewed_at
    console.log('🔄 Testing status update...');
    const statusData = {
      status: 'approved',
      reviewed_at: new Date().toISOString(),
    };
    
    console.log('🔄 Testing update with data:', statusData);
    
    const { data: statusResult, error: statusError } = await supabase
      .from('host_kyc')
      .update(statusData)
      .eq('id', testRecord.id)
      .select();
    
    if (statusError) {
      console.error('❌ Status update failed:', statusError);
      console.error('Error details:', {
        code: statusError.code,
        message: statusError.message,
        details: statusError.details,
        hint: statusError.hint
      });
    } else {
      console.log('✅ Status update successful:', statusResult);
    }
    
    // Test rejection with reason
    console.log('🔄 Testing rejection update...');
    const rejectionData = {
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      rejection_reason: 'Test rejection reason'
    };
    
    const { data: rejectionResult, error: rejectionError } = await supabase
      .from('host_kyc')
      .update(rejectionData)
      .eq('id', testRecord.id)
      .select();
    
    if (rejectionError) {
      console.error('❌ Rejection update failed:', rejectionError);
    } else {
      console.log('✅ Rejection update successful:', rejectionResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Usage: Call testKycUpdate() in browser console
window.testKycUpdate = testKycUpdate;
