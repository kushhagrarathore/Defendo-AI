import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import BrandLogo from "../components/BrandLogo"

const useCases = ["Residential Society", "Corporate Office", "Event / Production", "Personal Security"]
const communitySizes = ["< 100 residents", "100 - 500", "500 - 1000", "1000+"]

const UserSignup = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    useCase: useCases[0],
    communitySize: communitySizes[1],
    address: "",
  })
  const [agree, setAgree] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agree) {
      setError("Please agree to the terms and privacy policy.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const metadata = {
      role: "user",
      full_name: formData.fullName,
      phone: formData.phone,
      use_case: formData.useCase,
      community_size: formData.communitySize,
    }

    const result = await signUp(formData.email, formData.password, metadata)
    if (!result.success) {
      setError(result.error || "Unable to sign up. Please try again.")
      setIsLoading(false)
      return
    }

    const profilePayload = {
      id: result.user.id,
      email: formData.email,
      full_name: formData.fullName,
      phone: formData.phone,
      role: "user",
      terms_accepted: true,
      privacy_policy_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      privacy_policy_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" })

    setSuccess(true)
    setIsLoading(false)
    // Redirect to user portal if user is logged in, otherwise to login
    if (result.user) {
      setTimeout(() => navigate("/user-portal"), 1500)
    } else {
      setTimeout(() => navigate("/user-login"), 1800)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#eef4ff] to-white">
      <header className="px-6 md:px-12 py-4 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur">
        <Link to="/" className="flex items-center gap-3">
          <BrandLogo text="Defendo" imgClassName="h-10 w-auto" textClassName="text-xl font-semibold text-slate-900" />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500 hidden sm:inline">Citizen Portal</span>
        </Link>
        <div className="flex gap-3 text-sm">
          <Link to="/user-login" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:border-slate-300">
            Already have an account?
          </Link>
        </div>
      </header>

      <main className="px-6 md:px-12 py-10 grid lg:grid-cols-[1fr_0.9fr] gap-10">
        <section className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500 mb-4">Defendo users</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Book guards, patrols, and emergency response from one account.</h1>
            <p className="text-slate-600 mt-4 max-w-2xl">
              Defendo connects your society, office, or production with vetted security professionals, automated attendance, SOS alerts, and digital visitor control.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">You get</p>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-base">shield</span>
                Verified guards with live check-ins & guard timer
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-base">emergency</span>
                Emergency SOS for residents and facility managers
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-base">boards</span>
                Bookings + payouts dashboard for finance approvals
              </li>
            </ul>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_25px_60px_rgba(15,23,42,0.12)]"
        >
          <div className="mb-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-[0.3em] uppercase">
              Create account
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Secure services in less than 2 minutes</h2>
            <p className="text-sm text-slate-500">We’ll set up your profile inside the `profiles` table and guide your first booking.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              Account created! Redirecting you to your portal...
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-slate-700">Full name</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nikita Sharma"
                className="w-full mt-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 90000 12345"
                className="w-full mt-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full mt-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full mt-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full mt-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Primary use case</label>
              <select
                name="useCase"
                value={formData.useCase}
                onChange={handleChange}
                className="w-full mt-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              >
                {useCases.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Community / employee size</label>
              <select
                name="communitySize"
                value={formData.communitySize}
                onChange={handleChange}
                className="w-full mt-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              >
                {communitySizes.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">City / address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Bengaluru, Whitefield"
                className="w-full mt-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input type="checkbox" checked={agree} onChange={() => setAgree((prev) => !prev)} className="mt-1 rounded border-slate-300 text-blue-500 focus:ring-blue-200" />
              <span>
                I agree to Defendo’s{" "}
                <a href="#" className="text-blue-600 font-semibold">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 font-semibold">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-[0_18px_40px_rgba(37,99,235,0.35)] hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? "Creating account…" : "Create my booking account"}
            </motion.button>
          </form>
        </motion.section>
      </main>
    </div>
  )
}

export default UserSignup


