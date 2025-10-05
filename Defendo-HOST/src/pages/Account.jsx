import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, db } from '../lib/supabase'

const Account = () => {
  const { user, hostProfile, refreshProfile } = useAuth()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    if (hostProfile) {
      setForm({ ...hostProfile })
    }
  }, [hostProfile])

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
    <div>
      <h1 className="text-4xl font-extrabold mb-8">Account Settings</h1>
      <div className="max-w-2xl space-y-8">
        <div className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-bold mb-6">Company Profile</h2>
          <div className="space-y-6">
            {canEditKeys.has('company_name') && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Company Name</label>
                <input
                  type="text"
                  value={form.company_name || ''}
                  onChange={e => updateField('company_name', e.target.value)}
                  className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                />
              </div>
            )}
            {canEditKeys.has('full_name') && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Contact Name</label>
                <input
                  type="text"
                  value={form.full_name || ''}
                  onChange={e => updateField('full_name', e.target.value)}
                  className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                />
              </div>
            )}
            {canEditKeys.has('phone') && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone || ''}
                  onChange={e => updateField('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                />
              </div>
            )}
            {canEditKeys.has('address') && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Address</label>
                <input
                  type="text"
                  value={form.address || ''}
                  onChange={e => updateField('address', e.target.value)}
                  className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                />
              </div>
            )}
            {canEditKeys.has('company_description') || canEditKeys.has('bio') ? (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Company Description</label>
                <textarea
                  rows={4}
                  value={canEditKeys.has('company_description') ? (form.company_description || '') : (form.bio || '')}
                  onChange={e => canEditKeys.has('company_description') ? updateField('company_description', e.target.value) : updateField('bio', e.target.value)}
                  className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                />
              </div>
            ) : null}
          </div>
        </div>


        <div className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-bold mb-6">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Current Password</label>
              <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Password</label>
              <input type="password" value={passwords.next} onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
              <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]" />
            </div>
            <div className="flex justify-end">
              <button onClick={onChangePassword} className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">Update Password</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            {message && <span className="text-emerald-400">{message}</span>}
            {error && <span className="text-red-400">{error}</span>}
          </div>
          <button onClick={onSave} disabled={saving} className="bg-gradient-to-r from-[var(--primary-color)] via-emerald-400 to-[#2a5a3a] text-[#111714] px-8 py-3 rounded-full font-bold shadow-[0_10px_30px_rgba(74,222,128,0.25)] hover:shadow-[0_18px_40px_rgba(74,222,128,0.35)] transition-all disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Account
