import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Signup = () => {
  const [formData, setFormData] = useState({
    userType: "host", // Default to host
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [signupResult, setSignupResult] = useState(null)
  const { signUp, error, clearError } = useAuth()
  const navigate = useNavigate()

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
    
    if (formData.password !== formData.confirmPassword) {
      return
    }

    setIsLoading(true)

    const userData = {
      role: formData.userType, // Add role based on user selection
      full_name: formData.fullName,
      company_name: formData.companyName,
      phone: formData.phone,
      address: formData.address
    }

    const result = await signUp(formData.email, formData.password, userData)
    
    if (result.success) {
      setSignupResult(result)
      setSuccess(true)
      // Check if user is automatically logged in
      if (result.data?.user) {
        // User is logged in, redirect to dashboard immediately
        navigate('/dashboard')
      } else {
        // User needs to verify email, show success message and redirect to login
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }
    
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="bg-[#111714] text-white min-h-screen flex flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#29382f] px-10 py-4">
          <Link to="/" className="flex items-center gap-3 text-white">
            <svg className="h-8 w-8 text-[var(--primary-color)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
            </svg>
            <h2 className="text-xl font-bold tracking-tighter">Defendo Host</h2>
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#111714] text-2xl">check</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Account Created!</h2>
            <p className="text-gray-400">
              {signupResult?.data?.user 
                ? "Welcome to Defendo! Redirecting to your dashboard..." 
                : "Please check your email to verify your account. You'll be redirected to login shortly."
              }
            </p>
          </div>
        </main>
      </div>
    )
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
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight group-hover:text-[var(--primary-color)] transition-colors duration-300">Defendo Host</h1>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/login" className="group flex items-center gap-2 rounded-full bg-[#29382f] px-5 py-2.5 font-semibold hover:bg-[#3d5245] transition-all duration-300 relative overflow-hidden">
            <span className="relative z-10">Log In</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Signup Card */}
          <div className="bg-[#1a241e]/80 backdrop-blur-xl border border-[#29382f]/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[#2a5a3a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--primary-color)]/25">
                <span className="material-symbols-outlined text-[#111714] text-2xl">person_add</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                {formData.userType === "host" ? "Join Defendo Host" : "Join Defendo"}
              </h2>
              <p className="text-gray-400">
                {formData.userType === "host" 
                  ? "Register as a security service provider and start offering your services."
                  : "Create your account to book security services and stay protected."
                }
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-400">error</span>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* User Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-3">
                    Register as:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: "host" }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.userType === "host"
                          ? "border-[var(--primary-color)] bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
                          : "border-[#3d5245] bg-[#111714]/50 text-gray-400 hover:border-[var(--primary-color)]/50"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="material-symbols-outlined text-2xl">security</span>
                        <span className="font-medium">Security Provider</span>
                        <span className="text-xs opacity-75">Offer security services</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: "user" }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.userType === "user"
                          ? "border-[var(--primary-color)] bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
                          : "border-[#3d5245] bg-[#111714]/50 text-gray-400 hover:border-[var(--primary-color)]/50"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="material-symbols-outlined text-2xl">person</span>
                        <span className="font-medium">Regular User</span>
                        <span className="text-xs opacity-75">Book security services</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                      person
                    </span>
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm" 
                    id="full-name" 
                    name="fullName" 
                    placeholder="Full Name" 
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Company Name - Only for Hosts */}
                {formData.userType === "host" && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                        apartment
                      </span>
                    </div>
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm" 
                      id="company-name" 
                      name="companyName" 
                      placeholder="Company Name" 
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

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
                    placeholder="Email address" 
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                      phone
                    </span>
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm" 
                    id="contact-info" 
                    name="phone" 
                    placeholder="Phone Number" 
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Business Address - Only for Hosts */}
                {formData.userType === "host" && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                        location_on
                      </span>
                    </div>
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm" 
                      id="address" 
                      name="address" 
                      placeholder="Business Address" 
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

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
                    placeholder="Password" 
                    type="password"
                    value={formData.password}
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
                    id="confirm-password" 
                    name="confirmPassword" 
                    placeholder="Confirm Password" 
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>Passwords do not match</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading || formData.password !== formData.confirmPassword}
                className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-sm font-bold text-[#111714] bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] hover:shadow-lg hover:shadow-[var(--primary-color)]/25 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#111714] border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>Create Account</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?
                <Link to="/login" className="font-medium text-[var(--primary-color)] hover:text-opacity-80 ml-1 transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Signup
