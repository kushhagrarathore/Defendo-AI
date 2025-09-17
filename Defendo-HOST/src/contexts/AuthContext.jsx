import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, auth } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [hostProfile, setHostProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Initial session check:', { session, error })
        
        if (error) {
          console.error('Session error:', error)
          setError(error.message)
        } else if (session?.user) {
          console.log('Found existing session for user:', session.user.id)
          setUser(session.user)
          
          // Fetch host profile
          await loadHostProfile(session.user.id)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError('Failed to initialize authentication')
      } finally {
        // Safety: ensure loading stops even if HMR interrupts
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await loadHostProfile(session.user.id)
          setError(null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setHostProfile(null)
          setError(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed for user:', session.user.id)
          setUser(session.user)
        }
        
        // Stop loading on any auth event to recover UI during HMR
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load host profile
  const loadHostProfile = async (userId) => {
    try {
      console.log('Loading host profile for user:', userId)
      
      const { data: profile, error } = await supabase
        .from('host_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Host profile fetch error:', error)
        setError('Failed to load profile')
        return
      }
      
      console.log('Host profile loaded:', profile)
      setHostProfile(profile)
    } catch (err) {
      console.error('Profile loading error:', err)
      setError('Failed to load profile')
    }
  }

  // Sign up function
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userData }
      })

      if (error) {
        console.error('Sign up error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }

      // If the user is immediately created and signed in (email confirmations disabled), set state
      if (data?.user) {
        setUser(data.user)
        await loadHostProfile(data.user.id)
      }

      return { success: true, data }
    } catch (err) {
      console.error('Sign up catch error:', err)
      setError('Sign up failed')
      return { success: false, error: 'Sign up failed' }
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Sign in error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      if (!data.user) {
        setError('No user returned from sign in')
        return { success: false, error: 'No user returned' }
      }
      
      console.log('Sign in successful, user:', data.user.id)
      
      // The auth state change listener will handle setting user and loading profile
      return { success: true, user: data.user }
      
    } catch (err) {
      console.error('Sign in catch error:', err)
      setError('Sign in failed')
      return { success: false, error: 'Sign in failed' }
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        return { success: false, error: error.message }
      }
      
      // Clear local state
      setUser(null)
      setHostProfile(null)
      setError(null)
      
      return { success: true }
    } catch (err) {
      console.error('Sign out catch error:', err)
      return { success: false, error: 'Sign out failed' }
    } finally {
      setLoading(false)
    }
  }

  // Clear error function
  const clearError = () => {
    setError(null)
  }

  // Debug function to check current auth state
  const debugAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const { data: { user } } = await supabase.auth.getUser()
    
    console.log('=== Auth Debug ===')
    console.log('Session:', session)
    console.log('User:', user)
    console.log('Context user:', user)
    console.log('Context hostProfile:', hostProfile)
    
    return { session, user, contextUser: user, hostProfile }
  }

  const value = {
    user,
    hostProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
    debugAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}