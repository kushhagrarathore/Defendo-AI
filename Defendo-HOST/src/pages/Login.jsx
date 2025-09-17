import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/dashboard"

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    console.log('Login form submitted with:', { email: formData.email, password: '***' })
    console.log('Target route:', from)
    
    try {
      const result = await signIn(formData.email, formData.password)
      
      console.log('Login result:', result)
      
      if (result.success) {
        console.log('Login successful, navigating to:', from)
        console.log('User object:', result.data?.user)
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          console.log('Attempting navigation...')
          navigate(from, { replace: true })
        }, 100)
      } else {
        console.error('Login failed:', result.error)
      }
    } catch (error) {
      console.error('Exception during login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#0a0f0b] via-[#111714] to-[#0a0f0b] text-white min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary-color)]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--primary-color)] rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping opacity-40 delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full animate-ping opacity-50 delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-30 delay-1500"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#29382f]/50 px-10 py-4 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-3 text-white group">
          <div className="p-2 rounded-lg bg-[var(--primary-color)]/10 group-hover:bg-[var(--primary-color)]/20 transition-all duration-300">
            <svg className="h-6 w-6 text-[var(--primary-color)] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
              <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight group-hover:text-[var(--primary-color)] transition-colors duration-300">Defendo Host</h1>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary-color)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/signup" className="group flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] text-[#111714] text-sm font-bold leading-normal tracking-wide hover:shadow-lg hover:shadow-[var(--primary-color)]/25 transition-all duration-300 relative">
            <span className="relative z-10 truncate">Sign Up</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-[#1a241e]/80 backdrop-blur-xl border border-[#29382f]/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[#2a5a3a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--primary-color)]/25">
                <span className="material-symbols-outlined text-[#111714] text-2xl">security</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">
                Or
                <Link to="/signup" className="font-medium text-[var(--primary-color)] hover:text-opacity-80 ml-1 transition-colors">
                  start your 14-day free trial
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-400">error</span>
                  <div>
                    <p className="text-red-400 text-sm font-medium">
                      {error === 'Invalid login credentials' 
                        ? 'Invalid email or password. Please check your credentials and try again.'
                        : error === 'Login timeout after 5 seconds'
                        ? 'Login request timed out. Please check your internet connection and try again.'
                        : error
                      }
                    </p>
                    {error === 'Invalid login credentials' && (
                      <p className="text-red-300 text-xs mt-1">
                        Don't have an account? <Link to="/signup" className="underline hover:text-red-200">Sign up here</Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                      mail
                    </span>
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm" 
                    id="email-address" 
                    name="email" 
                    placeholder="user@example.com" 
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                      lock
                    </span>
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center group">
                  <input 
                    className="h-4 w-4 rounded border-[#3d5245] bg-[#111714]/50 text-[var(--primary-color)] focus:ring-[var(--primary-color)]/20 focus:ring-2" 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                  />
                  <label className="ml-3 block text-sm text-gray-300 group-hover:text-white transition-colors" htmlFor="remember-me">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a className="font-medium text-[var(--primary-color)] hover:text-opacity-80 transition-colors" href="#">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-sm font-bold text-[#111714] bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] hover:shadow-lg hover:shadow-[var(--primary-color)]/25 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#111714] border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>Log In</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Don't have an account?
                <Link to="/signup" className="font-medium text-[var(--primary-color)] hover:text-opacity-80 ml-1 transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Login
