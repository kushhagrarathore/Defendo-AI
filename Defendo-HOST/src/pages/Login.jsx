import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import BrandLogo from "../components/BrandLogo"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/dashboard"

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear local error when user starts typing
    if (loginError) setLoginError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (process.env.NODE_ENV === 'development') {
      console.log('Login form submitted with:', { email: formData.email, password: '***' })
      console.log('Target route:', from)
    }
    
    try {
      const result = await signIn(formData.email, formData.password)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Login result:', result)
      }
      
      if (result.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Login successful, navigating to:', from)
          console.log('User object:', result.data?.user)
        }
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Attempting navigation...')
          }
          navigate(from, { replace: true })
        }, 100)
      } else {
        console.error('Login failed:', result.error)
        setLoginError(result.error || 'Invalid login credentials')
      }
    } catch (error) {
      console.error('Exception during login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900 min-h-screen flex flex-col relative overflow-hidden">
      {/* Soft background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--primary-color)]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-[-6rem] w-80 h-80 bg-sky-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 px-6 md:px-10 py-4 backdrop-blur-sm bg-white/70">
        <Link to="/" className="flex items-center gap-3 text-slate-900 group">
          <BrandLogo
            text="Defendo Host"
            imgClassName="h-10 w-auto drop-shadow-sm"
            textClassName="text-xl font-bold tracking-tight group-hover:text-[var(--primary-color)] transition-colors duration-300"
          />
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary-color)] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            to="/signup"
            className="group flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[var(--primary-color)] text-[#0f172a] text-sm font-bold leading-normal tracking-wide hover:shadow-lg hover:shadow-[var(--primary-color)]/25 transition-all duration-300 relative"
          >
            <span className="relative z-10 truncate">Sign Up</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--primary-color)]/25">
                <span className="material-symbols-outlined text-white text-2xl">security</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500">
                Or
                <Link to="/signup" className="font-medium text-[var(--primary-color)] hover:text-emerald-500 ml-1 transition-colors">
                  start your 14-day free trial
                </Link>
              </p>
            </div>

            {loginError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500">error</span>
                  <div>
                    <p className="text-red-600 text-sm font-medium">
                      {loginError === 'Invalid login credentials' 
                        ? 'Invalid email or password. Please check your credentials and try again.'
                        : loginError === 'Login timeout after 5 seconds'
                        ? 'Login request timed out. Please check your internet connection and try again.'
                        : loginError
                      }
                    </p>
                    {loginError === 'Invalid login credentials' && (
                      <p className="text-red-500 text-xs mt-1">
                        Don't have an account? <Link to="/signup" className="underline hover:text-red-600">Sign up here</Link>
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
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                      mail
                    </span>
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300" 
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
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                      lock
                    </span>
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300" 
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
                    className="h-4 w-4 rounded border-slate-300 bg-white text-[var(--primary-color)] focus:ring-[var(--primary-color)]/20 focus:ring-2" 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                  />
                  <label className="ml-3 block text-sm text-slate-600 group-hover:text-slate-900 transition-colors" htmlFor="remember-me">
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
                className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-sm font-bold text-[#0f172a] bg-[var(--primary-color)] hover:shadow-lg hover:shadow-[var(--primary-color)]/25 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
              <p className="text-slate-500">
                Don't have an account?
                <Link to="/signup" className="font-medium text-[var(--primary-color)] hover:text-emerald-500 ml-1 transition-colors">
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
