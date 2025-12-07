import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { db } from "../lib/supabase"
import GlassCard from "../components/ui/GlassCard"
import PrimaryButton from "../components/ui/PrimaryButton"

const EditService = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [subcategoriesText, setSubcategoriesText] = useState('')
  const [subcategoriesError, setSubcategoriesError] = useState('')
  const SUBCATEGORY_PLACEHOLDER = `{
  "security_guard": { "label": "Security Guard", "price_per_hour": 200, "availability": 10, "images": [] }
}`

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await db.getHostServiceById(id)
      if (error) setError(error.message)
      setService(data || null)
      try {
        const raw = data?.sub_category
        if (raw) {
          const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
          setSubcategoriesText(JSON.stringify(obj, null, 2))
        } else {
          setSubcategoriesText('')
        }
      } catch (_) {
        setSubcategoriesText(String(data?.sub_category || ''))
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setService(prev => ({ ...prev, [name]: value }))
  }

  const handleToggleActive = () => {
    setService(prev => ({ ...prev, is_active: !prev.is_active }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSubcategoriesError('')

      let subcatToSave = null
      if (subcategoriesText && subcategoriesText.trim().length > 0) {
        try {
          const parsed = JSON.parse(subcategoriesText)
          subcatToSave = JSON.stringify(parsed)
        } catch (e) {
          setSubcategoriesError('Invalid JSON in subcategories')
          return
        }
      } else {
        subcatToSave = null
      }
      const updates = {
        service_name: service.service_name,
        description: service.description,
        city: service.city,
        state: service.state,
        is_active: service.is_active,
        sub_category: subcatToSave
      }
      const { error } = await db.updateHostService(id, updates)
      if (error) {
        setError(error.message)
        return
      }
      navigate('/dashboard/services')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Service not found</h3>
        <p className="text-slate-500">The service you're looking for doesn't exist</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-[var(--primary-color)] bg-clip-text text-transparent mb-3">
          Edit Service
        </h1>
        <p className="text-slate-600 text-base md:text-lg">Update your service details and settings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8 max-w-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Service Name</label>
            <input
              name="service_name"
              value={service.service_name || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all"
              placeholder="Enter service name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Description</label>
            <textarea
              name="description"
              rows={4}
              value={service.description || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all resize-none"
              placeholder="Describe your service..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-900">Subcategories (JSON)</label>
              {subcategoriesError && (
                <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">{subcategoriesError}</span>
              )}
            </div>
            <textarea
              rows={10}
              value={subcategoriesText}
              onChange={(e) => {
                setSubcategoriesText(e.target.value)
                if (subcategoriesError) setSubcategoriesError('')
              }}
              placeholder={SUBCATEGORY_PLACEHOLDER}
              className="w-full font-mono text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all min-h-[200px] resize-none"
            />
            <p className="text-slate-500 text-xs mt-2">💡 Tip: Provide valid JSON. Leave empty to remove subcategories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">State</label>
              <input
                name="state"
                value={service.state || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all"
                placeholder="Enter state"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">City</label>
              <input
                name="city"
                value={service.city || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all"
                placeholder="Enter city"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input 
              type="checkbox" 
              checked={!!service.is_active} 
              onChange={handleToggleActive} 
              className="w-5 h-5 rounded border-slate-300 text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 cursor-pointer" 
            />
            <label className="text-slate-900 font-semibold cursor-pointer">Active Service</label>
            <span className="ml-auto text-xs text-slate-500">
              {service.is_active ? '✅ Visible to customers' : '❌ Hidden from customers'}
            </span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[var(--primary-color)] to-emerald-500 text-white py-3 px-6 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-300/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/services')}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditService






