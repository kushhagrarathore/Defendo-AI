import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import BrandLogo from "../components/BrandLogo"

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
  const inputClass =
    "w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"

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
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900 flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 md:px-10 py-4 bg-white/80 backdrop-blur">
          <Link to="/" className="flex items-center gap-3 text-slate-900">
            <BrandLogo
              text="Defendo Host"
              imgClassName="h-10 w-auto drop-shadow-sm"
              textClassName="text-xl font-bold tracking-tight text-slate-900"
            />
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Go to dashboard
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-6 text-center bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.1)] border border-slate-100 p-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">check</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Account Created!</h2>
            <p className="text-slate-500">
              {signupResult?.data?.user 
                ? "Welcome to Defendo! Redirecting to your dashboard..." 
                : "Please verify your email. We’ll redirect you to login shortly."
              }
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900 flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 md:px-10 py-4 bg-white/80 backdrop-blur">
        <Link to="/" className="flex items-center gap-3 text-slate-900 group">
          <BrandLogo
            text="Defendo Host"
            imgClassName="h-10 w-auto drop-shadow-sm"
            textClassName="text-xl font-bold tracking-tight group-hover:text-[var(--primary-color)] transition-colors duration-300"
          />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden sm:flex items-center gap-2 text-slate-500">
            <span className="material-symbols-outlined text-base text-emerald-500">verified_user</span>
            Secure onboarding
          </span>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          >
            Log In
            <span className="material-symbols-outlined text-base">north_east</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center py-14 px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1 rounded-full mb-6">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Fast track onboarding
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">One account. All of Defendo.</h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              Whether you are a security agency or a business in need of reliable guards, Defendo brings every booking, payout,
              and guard assignment into a single powerful dashboard.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Provider ready', desc: 'Agencies scale bookings in weeks.' },
                { title: 'Smart compliance', desc: 'Built-in KYC & verification workflow.' },
                { title: 'Realtime visibility', desc: 'Track shifts and attendance live.' },
                { title: 'Priority payouts', desc: 'Automated invoicing every month.' }
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                    {['AP', 'KN', 'DL'][i]}
                  </div>
                ))}
              </div>
              Trusted by 500+ security businesses
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.15)]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">person_add</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                {formData.userType === "host" ? "Create your provider account" : "Create your Defendo account"}
              </h2>
              <p className="text-sm text-slate-500">
                {formData.userType === "host" 
                  ? "Register as a verified security provider and start receiving bookings."
                  : "Book trusted guards for corporate, residential, or event needs."
                }
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-500">error</span>
                  <p className="text-rose-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Register as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: "host" }))}
                      className={`p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${
                        formData.userType === "host"
                          ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                          : "border-slate-200 text-slate-500 hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span className="material-symbols-outlined text-2xl">security</span>
                        <span>Security Provider</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: "user" }))}
                      className={`p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${
                        formData.userType === "user"
                          ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                          : "border-slate-200 text-slate-500 hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span className="material-symbols-outlined text-2xl">person</span>
                        <span>Booking User</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <input 
                    className={inputClass}
                    id="full-name" 
                    name="fullName" 
                    placeholder="Full Name" 
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {formData.userType === "host" && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined">apartment</span>
                    </div>
                    <input 
                      className={inputClass}
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

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <input 
                    className={inputClass}
                    id="email-address" 
                    name="email" 
                    placeholder="Email address" 
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined">phone</span>
                  </div>
                  <input 
                    className={inputClass}
                    id="contact-info" 
                    name="phone" 
                    placeholder="Phone Number" 
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {formData.userType === "host" && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <input 
                      className={inputClass}
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

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input 
                    className={inputClass}
                    id="password" 
                    name="password" 
                    placeholder="Password" 
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input 
                    className={inputClass}
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
                <div className="flex items-center gap-2 text-rose-500 text-sm">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>Passwords do not match</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading || formData.password !== formData.confirmPassword}
                className="group relative w-full flex justify-center items-center py-4 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_18px_40px_rgba(16,185,129,0.3)] hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

            <div className="mt-8 text-center text-sm text-slate-500">
              Already have an account?
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 ml-1">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Signup
