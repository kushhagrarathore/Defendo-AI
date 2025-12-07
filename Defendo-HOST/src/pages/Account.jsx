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
      // Optional: reauthenticate with current password for security
      if (!user?.email) throw new Error('Missing user email')
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.current || ''
      })
      if (reauthError) throw new Error('Current password is incorrect')

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
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-3">
            Account Settings
          </h1>
          <p className="text-sm sm:text-base text-slate-500">
            Manage your company profile and security preferences in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-lg">business</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Company Profile</h2>
                <p className="text-xs text-slate-500">Update your company information</p>
              </div>
            </div>

            {/* Company Logo Section */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-600 mb-3">
                Company Logo
              </label>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden group hover:border-emerald-400 transition-all duration-200">
                  {companyLogo.length > 0 ? (
                    <img 
                      src={companyLogo[0]} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 text-xl group-hover:text-emerald-600 transition-colors">
                      business
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-3">
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
                    <span className="material-symbols-outlined text-slate-400 text-lg">
                      business
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.company_name || ''}
                    onChange={e => updateField('company_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200 transition-all duration-200 text-sm"
                    placeholder="Company Name"
                  />
                </div>
              )}

              {canEditKeys.has('full_name') && (
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-slate-400 text-lg">
                      person
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.full_name || ''}
                    onChange={e => updateField('full_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200 transition-all duration-200 text-sm"
                    placeholder="Contact Name"
                  />
                </div>
              )}

              {canEditKeys.has('phone') && (
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-slate-400 text-lg">
                      phone
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={form.phone || ''}
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200 transition-all duration-200 text-sm"
                    placeholder="Phone Number"
                  />
                </div>
              )}

              {canEditKeys.has('address') && (
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-slate-400 text-lg">
                      location_on
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.address || ''}
                    onChange={e => updateField('address', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200 transition-all duration-200 text-sm"
                    placeholder="Address"
                  />
                </div>
              )}

              {(canEditKeys.has('company_description') || canEditKeys.has('bio')) && (
                <div className="relative group">
                  <div className="absolute left-3 top-4 z-10">
                    <span className="material-symbols-outlined text-slate-400 text-lg">
                      description
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={canEditKeys.has('company_description') ? (form.company_description || '') : (form.bio || '')}
                    onChange={e => canEditKeys.has('company_description') ? updateField('company_description', e.target.value) : updateField('bio', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200 transition-all duration-200 resize-none text-sm"
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
            className="rounded-2xl p-6 border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-lg">
                  lock
                </span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Security Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Manage your account security
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    lock
                  </span>
                </div>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200 transition-all duration-200 text-sm"
                  placeholder="Current Password"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    lock_reset
                  </span>
                </div>
                <input
                  type="password"
                  value={passwords.next}
                  onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200 transition-all duration-200 text-sm"
                  placeholder="New Password"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    verified_user
                  </span>
                </div>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200 transition-all duration-200 text-sm"
                  placeholder="Confirm New Password"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={onChangePassword} 
                  className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-all duration-200"
                >
                  Update Password
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Messages */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-h-[32px]">
            {message && (
              <div className="flex items-center gap-2 text-emerald-700 text-sm">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span className="font-medium">{message}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-rose-600 text-sm">
                <span className="material-symbols-outlined text-base">error</span>
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Save Changes Button */}
          <motion.button 
            onClick={onSave} 
            disabled={saving}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow-[0_12px_30px_rgba(16,185,129,0.4)] hover:bg-emerald-600 hover:shadow-[0_16px_40px_rgba(16,185,129,0.45)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                Saving…
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">save</span>
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
