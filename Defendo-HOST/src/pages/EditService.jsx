import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { db, supabase } from "../lib/supabase"
import GlassCard from "../components/ui/GlassCard"
import PrimaryButton from "../components/ui/PrimaryButton"
import { motion } from "framer-motion"

const EditService = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [subcategoriesText, setSubcategoriesText] = useState('')
  const [subcategoriesError, setSubcategoriesError] = useState('')
  const [subcategoryImages, setSubcategoryImages] = useState({}) // Map of subcategoryKey -> image URLs
  const SUBCATEGORY_PLACEHOLDER = `{
  "security_guard": { "label": "Security Guard", "price_per_hour": 200, "availability": 10, "images": [] }
}`

  const parseSubcategories = (subCategoryText) => {
    if (!subCategoryText) return {}
    try {
      const parsed = typeof subCategoryText === 'string' 
        ? JSON.parse(subCategoryText) 
        : subCategoryText
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch (_) {
      return {}
    }
  }

  // Generate signed URLs for subcategory images
  const generateSignedUrls = async (subcategories) => {
    const imageUrls = {}
    
    for (const [key, subcat] of Object.entries(subcategories)) {
      if (subcat.images && subcat.images.length > 0) {
        const freshUrls = []
        
        for (const imagePath of subcat.images) {
          try {
            // If it's already a full URL, use it directly
            if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
              if (imagePath.includes('?') || imagePath.includes('/public/')) {
                freshUrls.push(imagePath)
                continue
              }
            }
            
            let filePath = imagePath
            
            // Extract file path from URL if needed
            if (imagePath.includes('/storage/v1/object/')) {
              let urlParts
              if (imagePath.includes('/public/guard_services/')) {
                urlParts = imagePath.split('/storage/v1/object/public/guard_services/')
              } else if (imagePath.includes('/guard_services/')) {
                const match = imagePath.match(/\/guard_services\/(.+?)(\?|$)/)
                if (match && match[1]) {
                  filePath = match[1]
                } else {
                  urlParts = imagePath.split('/storage/v1/object/guard_services/')
                }
              }
              
              if (urlParts && urlParts.length > 1) {
                filePath = urlParts[1].split('?')[0]
              } else if (!filePath || filePath === imagePath) {
                freshUrls.push(imagePath)
                continue
              }
            }
            
            // Skip if still a full URL
            if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
              freshUrls.push(filePath)
              continue
            }
            
            // Generate fresh signed URL
            const { data: signedUrlData, error } = await supabase.storage
              .from('guard_services')
              .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days expiry
            
            if (error) {
              console.error('Error generating signed URL for', filePath, ':', error)
              if (imagePath.startsWith('http')) {
                freshUrls.push(imagePath)
              }
            } else {
              freshUrls.push(signedUrlData.signedUrl)
            }
          } catch (err) {
            console.error('Error processing image path:', imagePath, err)
            if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
              freshUrls.push(imagePath)
            }
          }
        }
        
        if (freshUrls.length > 0) {
          imageUrls[key] = freshUrls
        }
      }
    }
    
    return imageUrls
  }

  // Load images when subcategories change
  useEffect(() => {
    if (subcategoriesText) {
      try {
        const subcategories = parseSubcategories(subcategoriesText)
        if (subcategories && Object.keys(subcategories).length > 0) {
          generateSignedUrls(subcategories).then(setSubcategoryImages)
        } else {
          setSubcategoryImages({})
        }
      } catch (_) {
        setSubcategoryImages({})
      }
    } else {
      setSubcategoryImages({})
    }
  }, [subcategoriesText])

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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-900">Subcategories (JSON)</label>
              {subcategoriesError && (
                <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">{subcategoriesError}</span>
              )}
            </div>

            {/* Visual Preview of Subcategories with Images */}
            {(() => {
              try {
                const subcategories = parseSubcategories(subcategoriesText)
                if (subcategories && Object.keys(subcategories).length > 0) {
                  return (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">preview</span>
                        Subcategory Preview
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {Object.entries(subcategories).map(([key, subcat]) => {
                          const images = subcategoryImages[key] || []
                          const firstImage = images.length > 0 ? images[0] : null
                          
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                {/* Subcategory Image */}
                                {firstImage ? (
                                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                    <img 
                                      src={firstImage} 
                                      alt={subcat.label || key}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.nextSibling.style.display = 'flex'
                                      }}
                                    />
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold hidden">
                                      {subcat.label?.[0]?.toUpperCase() || key[0]?.toUpperCase() || 'G'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold">
                                    {subcat.label?.[0]?.toUpperCase() || key[0]?.toUpperCase() || 'G'}
                                  </div>
                                )}
                                
                                {/* Subcategory Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-slate-900 mb-1 truncate">
                                    {subcat.label || key}
                                  </h4>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-slate-600">Price:</span>
                                      <span className="text-sm font-bold text-[var(--primary-color)]">
                                        {subcat.currency || 'INR'} {subcat.price_per_hour || 0}/hr
                                      </span>
                                    </div>
                                    {subcat.availability !== undefined && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600">Availability:</span>
                                        <span className="text-xs font-semibold text-green-600">
                                          {subcat.availability} units
                                        </span>
                                      </div>
                                    )}
                                    {images.length > 0 && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600">Images:</span>
                                        <span className="text-xs font-semibold text-blue-600">
                                          {images.length} {images.length === 1 ? 'image' : 'images'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Additional Images Thumbnails */}
                                  {images.length > 1 && (
                                    <div className="flex gap-1 mt-2">
                                      {images.slice(1, 4).map((img, idx) => (
                                        <div key={idx} className="w-8 h-8 rounded border border-slate-200 overflow-hidden bg-slate-100">
                                          <img 
                                            src={img} 
                                            alt={`${subcat.label || key} ${idx + 2}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none'
                                            }}
                                          />
                                        </div>
                                      ))}
                                      {images.length > 4 && (
                                        <div className="w-8 h-8 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                          +{images.length - 4}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
              } catch (_) {
                return null
              }
            })()}

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
            <p className="text-slate-500 text-xs mt-2">💡 Tip: Provide valid JSON. Leave empty to remove subcategories. Images will be displayed automatically when valid image paths are provided.</p>
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






