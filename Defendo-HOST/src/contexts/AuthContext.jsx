import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user session safely
  const fetchSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error('Session fetch error:', error);
    if (session?.user) {
      setUser(session.user);
      // Fire-and-forget profile fetch to avoid blocking initial render
      fetchHostProfile(session.user.id);
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  // ✅ Fetch host profile
  const fetchHostProfile = async (userId) => {
    if (!userId) {
      console.warn('fetchHostProfile called with undefined userId');
      return;
    }

    console.log('🔍 Loading host profile for user:', userId);

    const { data, error } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // ✅ prevents 406

    if (error) {
      console.error('Error fetching host profile:', error);
    } else {
      console.log('✅ Host profile loaded:', data);
      setProfile(data);
    }

    // ✅ Optional: check if user is a super admin
    await fetchSuperAdmin(userId);
  };

  // ✅ Fetch super admin safely
  const fetchSuperAdmin = async (userId) => {
    const { data, error } = await supabase
      .from('super_admins')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // ✅ avoids 406

    if (error) {
      console.warn('Super admin fetch error:', error);
      return;
    }

    if (data) {
      console.log('🧠 User is super admin:', data);
      setProfile((prev) => ({ ...prev, is_super_admin: true }));
    }
  };

  // ✅ Auth state listener
  useEffect(() => {
    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        setUser(session.user);
        // Do not block UI on profile fetch during auth change
        fetchHostProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      console.log('Attempting sign in for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('Sign in successful, user:', data.user.id);
        setUser(data.user);
        await fetchHostProfile(data.user.id);
        return { success: true, user: data.user };
      }

      return { success: false, error: 'No user data returned' };
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }

      return { success: false, error: 'No user data returned' };
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
      }

      setUser(null);
      setProfile(null);
      
      return { success: true };
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchHostProfile(user.id);
    }
  };

  const value = {
    user,
    hostProfile: profile, // Keep backward compatibility
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};