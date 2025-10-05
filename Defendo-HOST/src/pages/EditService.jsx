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
    return <div className="text-white/70">Service not found</div>
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Edit Service</h1>
        <p className="text-white/70 mt-1">Update your service details</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <GlassCard className="max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Service Name</label>
            <input
              name="service_name"
              value={service.service_name || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Description</label>
            <textarea
              name="description"
              rows={4}
              value={service.description || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white"
            />
          </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white">Subcategories (JSON)</label>
            {subcategoriesError ? (
              <span className="text-red-400 text-xs">{subcategoriesError}</span>
            ) : null}
          </div>
          <textarea
            rows={10}
            value={subcategoriesText}
            onChange={(e) => {
              setSubcategoriesText(e.target.value)
              if (subcategoriesError) setSubcategoriesError('')
            }}
            placeholder={SUBCATEGORY_PLACEHOLDER}
            className="w-full font-mono text-sm px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white min-h-[200px]"
          />
          <p className="text-white/50 text-xs">Tip: Provide valid JSON. Leave empty to remove subcategories.</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">State</label>
              <input
                name="state"
                value={service.state || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">City</label>
              <input
                name="city"
                value={service.city || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" checked={!!service.is_active} onChange={handleToggleActive} className="w-4 h-4" />
            <span className="text-white">Active</span>
          </div>

          <div className="flex gap-3 pt-2">
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => navigate('/dashboard/services')}
              className="bg-[#29382f] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#3a4a3f] transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default EditService






