import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase, db } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'

const Account = () => {
  const { user, hostProfile, refreshProfile } = useAuth()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [companyLogo, setCompanyLogo] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    if (hostProfile) {
      setForm({ ...hostProfile })
    }
  }, [hostProfile])

  // Fetch services to get company logo
  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.id) return
      try {
        const { data: servicesData } = await db.getHostServices(user.id)
        if (servicesData && servicesData.length > 0) {
          setServices(servicesData)
          // Get logo from first service's images
          const firstService = servicesData[0]
          if (firstService.images && firstService.images.length > 0) {
            setCompanyLogo(firstService.images)
          }
        }
      } catch (err) {
        console.error('Error fetching services for logo:', err)
      }
    }
    fetchServices()
  }, [user?.id])

  const canEditKeys = useMemo(() => new Set(Object.keys(form || {})), [form])

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const onSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const candidateKeys = ['full_name','company_name','phone','address','company_description','bio']
      const updates = {}
      candidateKeys.forEach(k => { if (canEditKeys.has(k) && form[k] !== undefined) updates[k] = form[k] })
      if (Object.keys(updates).length === 0) {
        setMessage('Nothing to update')
      } else {
        const { error: updErr } = await db.updateHostProfile(user.id, updates)
        if (updErr) throw updErr
        // Refresh local profile so UI (e.g., service cards) picks up new company name immediately
        try { await refreshProfile() } catch (_) {}
        setMessage('Saved successfully')
      }
    } catch (e) {
      setError(e.message || 'Failed to save changes')
    } finally {
      setSaving(false)
      setTimeout(() => { setMessage(''); setError('') }, 3000)
    }
  }


  const onChangePassword = async () => {
    setError(''); setMessage('')
    if (!passwords.next || passwords.next.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (passwords.next !== passwords.confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password: passwords.next })
      if (updErr) throw updErr
      setMessage('Password updated')
      setPasswords({ current: '', next: '', confirm: '' })
    } catch (e) {
      setError(e.message || 'Failed to update password')
    } finally {
      setTimeout(() => { setMessage(''); setError('') }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0f0e] text-[#e0e0e0] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-[#00ff87] bg-clip-text text-transparent mb-4">
            Account Settings
          </h1>
          <p className="text-[#e0e0e0]/70 text-lg">Manage your company profile and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 bg-[#0f0f0f]/80 backdrop-blur-sm border border-[#1f1f1f] shadow-xl"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#00ff87]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00ff87] text-lg">business</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Company Profile</h2>
                <p className="text-gray-400 text-sm">Update your company information</p>
              </div>
            </div>

            {/* Company Logo Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Company Logo</label>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-[#121212] border border-[#1f1f1f] flex items-center justify-center overflow-hidden group hover:border-[#00ff87]/40 transition-all duration-300">
                  {companyLogo.length > 0 ? (
                    <img 
                      src={companyLogo[0]} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-gray-500 text-xl group-hover:text-[#00ff87] transition-colors">business</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-3">
                    {companyLogo.length > 0 
                      ? "Logo from your service images. Upload a new logo to update it."
                      : "No company logo found. Add a service with images to set your company logo."
                    }
                  </p>
                  <ImageUpload
                    images={companyLogo}
                    onImagesChange={setCompanyLogo}
                    maxImages={1}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {canEditKeys.has('company_name') && (
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-gray-500 text-lg">business</span>
                  </div>
                  <input
                    type="text"
                    value={form.company_name || ''}
                    onChange={e => updateField('company_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]/20 transition-all duration-300"
                    placeholder="Company Name"
                  />
                </div>
              )}

              {canEditKeys.has('full_name') && (
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-gray-500 text-lg">person</span>
                  </div>
                  <input
                    type="text"
                    value={form.full_name || ''}
                    onChange={e => updateField('full_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]/20 transition-all duration-300"
                    placeholder="Contact Name"
                  />
                </div>
              )}

              {canEditKeys.has('phone') && (
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-gray-500 text-lg">phone</span>
                  </div>
                  <input
                    type="tel"
                    value={form.phone || ''}
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]/20 transition-all duration-300"
                    placeholder="Phone Number"
                  />
                </div>
              )}

              {canEditKeys.has('address') && (
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-gray-500 text-lg">location_on</span>
                  </div>
                  <input
                    type="text"
                    value={form.address || ''}
                    onChange={e => updateField('address', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]/20 transition-all duration-300"
                    placeholder="Address"
                  />
                </div>
              )}

              {(canEditKeys.has('company_description') || canEditKeys.has('bio')) && (
                <div className="relative group">
                  <div className="absolute left-3 top-4 z-10">
                    <span className="material-symbols-outlined text-gray-500 text-lg">description</span>
                  </div>
                  <textarea
                    rows={4}
                    value={canEditKeys.has('company_description') ? (form.company_description || '') : (form.bio || '')}
                    onChange={e => canEditKeys.has('company_description') ? updateField('company_description', e.target.value) : updateField('bio', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]/20 transition-all duration-300 resize-none"
                    placeholder="Company Description"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Security Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6 bg-[#0f0f0f]/80 backdrop-blur-sm border border-[#1f1f1f] shadow-xl"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#00ff87]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00ff87] text-lg">lock</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Security Settings</h2>
                <p className="text-gray-400 text-sm">Manage your account security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <span className="material-symbols-outlined text-gray-500 text-lg">lock</span>
                </div>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]/20 transition-all duration-300"
                  placeholder="Current Password"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <span className="material-symbols-outlined text-gray-500 text-lg">lock_reset</span>
                </div>
                <input
                  type="password"
                  value={passwords.next}
                  onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]/20 transition-all duration-300"
                  placeholder="New Password"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <span className="material-symbols-outlined text-gray-500 text-lg">verified_user</span>
                </div>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-white placeholder-gray-500 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]/20 transition-all duration-300"
                  placeholder="Confirm New Password"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={onChangePassword} 
                  className="px-4 py-2 rounded-lg border border-[#00ff87]/30 bg-[#00ff87]/10 hover:bg-[#00ff87]/20 text-[#00ff87] font-medium transition-all duration-300 hover:scale-105"
                >
                  Update Password
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Messages */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {message && (
              <div className="flex items-center gap-2 text-[#00ff87]">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span className="font-medium">{message}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined text-lg">error</span>
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Save Changes Button */}
          <motion.button 
            onClick={onSave} 
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-[#00ff87] text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Saving…
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">save</span>
                Save Changes
              </div>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Account
