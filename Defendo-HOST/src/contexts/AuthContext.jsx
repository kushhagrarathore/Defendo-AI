import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, auth, db } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [hostProfile, setHostProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load host profile when user changes
  const loadHostProfile = async (hostId) => {
    if (!hostId) {
      setHostProfile(null)
      return
    }

    try {
      // Load host profile (all users are hosts in this platform)
      const { data: hostProfileData, error: hostError } = await db.getHostProfile(hostId)
      if (hostError) {
        console.error('Error loading host profile:', hostError)
        setHostProfile(null)
      } else {
        setHostProfile(hostProfileData)
      }
    } catch (err) {
      console.error('Error loading host profile:', err)
      setHostProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        setError(error.message)
      } else {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadHostProfile(session.user.id)
        }
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadHostProfile(session.user.id)
        } else {
          setHostProfile(null)
        }
        
        setLoading(false)
        
        if (event === 'SIGNED_OUT') {
          setError(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      let result
      
      if (userData.role === "host") {
        // Sign up as host
        result = await auth.signUpHost(
          email, 
          password, 
          userData.full_name || '', 
          userData.phone || '', 
          userData.company_name || '',
          userData.address || ''
        )
      } else {
        // Sign up as regular user
        result = await auth.signUpUser(
          email, 
          password, 
          userData.full_name || '', 
          userData.phone || ''
        )
      }
      
      if (result.error) {
        setError(result.error.message)
        return { success: false, error: result.error.message }
      }
      
      return { success: true, data: result.data }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    console.log("AuthContext: Starting signIn process")
    setLoading(true)
    setError(null)
    
    try {
      console.log("AuthContext: Calling auth.loginHost")
      const { data, error } = await auth.loginHost(email, password)
      
      console.log("AuthContext: loginHost response:", { data, error })
      
      if (error) {
        console.error("AuthContext: Login error:", error.message)
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      // The loginHost function returns { data: { auth: data, host }, error: null }
      // We need to extract the auth data and set the host profile
      if (data && data.auth) {
        console.log("AuthContext: Setting user and host profile")
        setUser(data.auth.user)
        if (data.host) {
          setHostProfile(data.host)
        }
        console.log("AuthContext: Login successful")
        return { success: true, data: data.auth }
      }
      
      console.error("AuthContext: No auth data received")
      return { success: false, error: 'Login failed' }
    } catch (err) {
      console.error("AuthContext: Exception during login:", err)
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await auth.signOut()
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  const value = {
    user,
    hostProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
    isAuthenticated: !!user,
    loadHostProfile: () => user && loadHostProfile(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

