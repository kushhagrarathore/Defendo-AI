import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AuthDebugger = () => {
  const { user, hostProfile, error, handleRefreshTokenError } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);

  const runDebug = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      // Test host profile query
      let profileTest = null;
      if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from('host_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        profileTest = { data: profile, error: profileError };
      }

      setDebugInfo({
        session: {
          exists: !!session,
          user_id: session?.user?.id,
          expires_at: session?.expires_at,
          error: sessionError
        },
        user: {
          exists: !!currentUser,
          id: currentUser?.id,
          email: currentUser?.email,
          error: userError
        },
        hostProfile: profileTest,
        context: {
          user: !!user,
          hostProfile: !!hostProfile,
          error
        }
      });
    } catch (err) {
      setDebugInfo({ error: err.message });
    }
  };

  const clearSession = async () => {
    try {
      await supabase.auth.signOut();
      setDebugInfo(null);
    } catch (err) {
      console.error('Error clearing session:', err);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      console.log('Refresh result:', { data, error });
      await runDebug();
    } catch (err) {
      console.error('Error refreshing session:', err);
    }
  };

  const createHostProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      const { data, error } = await supabase
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
        .maybeSingle();

      if (error) {
        console.error('Error creating host profile:', error);
      } else {
        console.log('Host profile created:', data);
        await runDebug();
      }
    } catch (err) {
      console.error('Error creating host profile:', err);
    }
  };

  const testAdminDashboard = async () => {
    try {
      // Import and run the admin dashboard test
      const { testAdminDashboard } = await import('../utils/testAdminDashboard.js');
      await testAdminDashboard();
    } catch (err) {
      console.error('Error running admin dashboard test:', err);
    }
  };

  const testSuperAdminStorage = async () => {
    try {
      // Import and run the super admin storage test
      const { testSuperAdminStorage } = await import('../utils/testSuperAdminStorage.js');
      await testSuperAdminStorage();
    } catch (err) {
      console.error('Error running super admin storage test:', err);
    }
  };

  const debugKycData = async () => {
    try {
      // Import and run the KYC data debug
      const { debugKycData } = await import('../utils/debugKycData.js');
      await debugKycData();
    } catch (err) {
      console.error('Error running KYC data debug:', err);
    }
  };

  const checkStorageBuckets = async () => {
    try {
      // Import and run the storage bucket check
      const { checkStorageBuckets } = await import('../utils/checkStorageBuckets.js');
      await checkStorageBuckets();
    } catch (err) {
      console.error('Error checking storage buckets:', err);
    }
  };

  const testKycUpdate = async () => {
    try {
      // Import and run the KYC update test
      const { testKycUpdate } = await import('../utils/testKycUpdate.js');
      await testKycUpdate();
    } catch (err) {
      console.error('Error testing KYC update:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">Auth Debugger</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runDebug}
          className="bg-blue-500 px-2 py-1 rounded text-xs mr-2"
        >
          Run Debug
        </button>
        <button
          onClick={refreshSession}
          className="bg-green-500 px-2 py-1 rounded text-xs mr-2"
        >
          Refresh Session
        </button>
        <button
          onClick={createHostProfile}
          className="bg-purple-500 px-2 py-1 rounded text-xs mr-2"
        >
          Create Profile
        </button>
        <button
          onClick={testAdminDashboard}
          className="bg-orange-500 px-2 py-1 rounded text-xs mr-2"
        >
          Test Admin
        </button>
        <button
          onClick={testSuperAdminStorage}
          className="bg-cyan-500 px-2 py-1 rounded text-xs mr-2"
        >
          Test Storage
        </button>
        <button
          onClick={debugKycData}
          className="bg-pink-500 px-2 py-1 rounded text-xs mr-2"
        >
          Debug KYC
        </button>
        <button
          onClick={checkStorageBuckets}
          className="bg-indigo-500 px-2 py-1 rounded text-xs mr-2"
        >
          Check Buckets
        </button>
        <button
          onClick={testKycUpdate}
          className="bg-yellow-500 px-2 py-1 rounded text-xs mr-2"
        >
          Test Update
        </button>
        <button
          onClick={clearSession}
          className="bg-red-500 px-2 py-1 rounded text-xs"
        >
          Clear Session
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-2">
          <div>
            <strong>Session:</strong> {debugInfo.session?.exists ? '✅' : '❌'}
            {debugInfo.session?.error && (
              <div className="text-red-400">Error: {debugInfo.session.error.message}</div>
            )}
          </div>
          
          <div>
            <strong>User:</strong> {debugInfo.user?.exists ? '✅' : '❌'}
            {debugInfo.user?.error && (
              <div className="text-red-400">Error: {debugInfo.user.error.message}</div>
            )}
          </div>
          
          <div>
            <strong>Host Profile:</strong> {debugInfo.hostProfile?.data ? '✅' : '❌'}
            {debugInfo.hostProfile?.error && (
              <div className="text-red-400">Error: {debugInfo.hostProfile.error.message}</div>
            )}
          </div>
          
          <div>
            <strong>Context User:</strong> {debugInfo.context?.user ? '✅' : '❌'}
            <strong>Context Profile:</strong> {debugInfo.context?.hostProfile ? '✅' : '❌'}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
