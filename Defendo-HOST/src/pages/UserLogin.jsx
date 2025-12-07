import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import BrandLogo from "../components/BrandLogo"

const supportPoints = [
  { icon: "verified_user", label: "Trusted & verified guards" },
  { icon: "campaign", label: "Instant booking alerts" },
  { icon: "schedule", label: "24/7 concierge support" },
]

const testimonials = [
  {
    quote: "I booked corporate event security in 5 minutes and tracked everything online.",
    name: "Nikita, Ops Lead • Mumbai",
  },
  {
    quote: "Defendo keeps our residential society covered round the clock with vetted pros.",
    name: "Arjun, Society Secretary • Bengaluru",
  },
]

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/user-portal"

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.")
      return
    }
    setIsLoading(true)
    const result = await signIn(formData.email, formData.password)
    setIsLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || "Unable to log in. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-white to-[#f5fbff] text-slate-900 flex flex-col">
      <header className="px-6 md:px-12 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <BrandLogo text="Defendo" imgClassName="h-10 w-auto drop-shadow-sm" textClassName="text-lg font-semibold text-slate-900" />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500 hidden sm:inline">Citizen Portal</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/partner" className="text-slate-500 hover:text-slate-900">
            Become a provider
          </Link>
          <Link to="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:border-slate-300">
            Host login
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-12 py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
        <div className="space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-500 mb-4">Book trusted security</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
              Manage all your Defendo bookings from one beautiful dashboard.
            </h1>
            <p className="text-slate-600 max-w-2xl mt-4">
              Track guard arrivals, approve schedules, and chat with concierge in real time. Available for societies, offices, events, and personal protection.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {supportPoints.map((point) => (
              <div key={point.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-500">{point.icon}</span>
                <p className="text-sm font-semibold text-slate-700">{point.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 space-y-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">What users say</p>
            <div className="space-y-4">
              {testimonials.map((item) => (
                <div key={item.name}>
                  <p className="text-slate-700 italic">“{item.quote}”</p>
                  <p className="text-sm font-semibold text-slate-500 mt-1">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-[0.3em]">
              Welcome back
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mt-4">Sign in to manage bookings</h2>
            <p className="text-sm text-slate-500 mt-2">Use the same email you booked with on the app.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-blue-500 focus:ring-blue-200" />
                Remember me
              </label>
              <button type="button" className="text-blue-600 font-medium hover:text-blue-700">
                Forgot password?
              </button>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-[0_18px_35px_rgba(37,99,235,0.35)] hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? "Signing in…" : "Access my dashboard"}
            </motion.button>
          </form>

          <div className="mt-8 space-y-4 text-center text-sm text-slate-500">
            <p>
              Need to create a booking account?{" "}
              <Link to="/user-signup" className="text-blue-600 font-semibold hover:text-blue-700">
                Sign up as a user
              </Link>
            </p>
            <p className="text-xs text-slate-400">By continuing you agree to Defendo’s Terms and Privacy Policy.</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default UserLogin

