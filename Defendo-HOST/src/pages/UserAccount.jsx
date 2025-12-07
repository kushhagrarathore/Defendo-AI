import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import UserLayout from "../components/UserLayout"

const GOLDEN_YELLOW = "#DAA520"
const SOFT_GREY = "#F7F7F7"
const BLACK_TEXT = "#1A1A1A"

const UserAccount = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      })
    } else if (user) {
      setFormData({
        full_name: "",
        email: user.email || "",
        phone: "",
        address: "",
      })
    }
  }, [profile, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
    if (message) setMessage("")
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    setSaving(true)
    setError("")
    setMessage("")

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )

      if (updateError) throw updateError

      setMessage("Profile updated successfully!")
      await refreshProfile()
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match")
      return
    }

    if (passwords.new.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setChangingPassword(true)
    setError("")
    setMessage("")

    try {
      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.new,
      })

      if (updateError) throw updateError

      setMessage("Password changed successfully!")
      setPasswords({ current: "", new: "", confirm: "" })
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error("Error changing password:", err)
      setError(err.message || "Failed to change password. Please try again.")
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
            Account Settings
          </h1>
          <p className="text-gray-600">Manage your personal information and security settings</p>
        </motion.div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span>{message}</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${GOLDEN_YELLOW}15` }}
              >
                <span className="material-symbols-outlined" style={{ color: GOLDEN_YELLOW }}>
                  person
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: BLACK_TEXT }}>
                  Profile Information
                </h2>
                <p className="text-sm text-gray-500">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all"
                  style={{ backgroundColor: SOFT_GREY }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 90000 12345"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all"
                  style={{ backgroundColor: SOFT_GREY }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all resize-none"
                  style={{ backgroundColor: SOFT_GREY }}
                />
              </div>

              <motion.button
                onClick={handleSaveProfile}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: GOLDEN_YELLOW }}
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${GOLDEN_YELLOW}15` }}
              >
                <span className="material-symbols-outlined" style={{ color: GOLDEN_YELLOW }}>
                  lock
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: BLACK_TEXT }}>
                  Security Settings
                </h2>
                <p className="text-sm text-gray-500">Change your password</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all"
                  style={{ backgroundColor: SOFT_GREY }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all"
                  style={{ backgroundColor: SOFT_GREY }}
                />
              </div>

              {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}

              <motion.button
                onClick={handleChangePassword}
                disabled={changingPassword || !passwords.new || passwords.new !== passwords.confirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: GOLDEN_YELLOW }}
              >
                {changingPassword ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Changing...</span>
                  </div>
                ) : (
                  "Change Password"
                )}
              </motion.button>
            </div>

            {/* Additional Security Info */}
            <div className="mt-8 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Security Tips</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Use a strong, unique password</li>
                <li>• Don't share your password with anyone</li>
                <li>• Enable two-factor authentication if available</li>
                <li>• Log out from shared devices</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </UserLayout>
  )
}

export default UserAccount



