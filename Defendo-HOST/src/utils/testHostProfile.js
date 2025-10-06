// Test Host Profile Creation
// Run this in browser console to test host profile creation

import { supabase } from '../lib/supabase';

export const testHostProfile = async () => {
  console.log('Testing host profile creation...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return;
    }
    console.log('Current user:', user.id, user.email);

    // Check if host profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.log('Host profile not found, creating one...');
      
      // Create host profile
      const { data: newProfile, error: createError } = await supabase
        .from('host_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          company_name: user.user_metadata?.company_name || '',
          phone: user.user_metadata?.phone || '',
          address: user.user_metadata?.address || '',
          services_offered: []
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create host profile:', createError);
        return;
      }

      console.log('✅ Host profile created successfully:', newProfile);
    } else {
      console.log('✅ Host profile already exists:', existingProfile);
    }

    // Test fetching the profile again
    const { data: testProfile, error: testError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (testError) {
      console.error('❌ Failed to fetch host profile after creation:', testError);
    } else {
      console.log('✅ Host profile fetch successful:', testProfile);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Usage: Call testHostProfile() in browser console
window.testHostProfile = testHostProfile;





















