import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import ServiceImageCarousel from "./ServiceImageCarousel"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { db, supabase } from "../lib/supabase"

const ServiceDetailView = ({ service, onBack, onEdit, onDelete }) => {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [subcategoryImages, setSubcategoryImages] = useState({})
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
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

  // Generate fresh signed URLs for subcategory images
  const generateSignedUrls = async (subcategories) => {
    const imageUrls = {}
    
    for (const [key, subcat] of Object.entries(subcategories)) {
      if (subcat.images && subcat.images.length > 0) {
        const freshUrls = []
        
        for (const imagePath of subcat.images) {
          try {
            // Check if it's already a file path or a URL
            let filePath = imagePath
            
            // If it's a URL, extract the file path
            if (imagePath.includes('/storage/v1/object/')) {
              // Handle both public and private bucket URLs
              let urlParts
              if (imagePath.includes('/public/guard_services/')) {
                urlParts = imagePath.split('/storage/v1/object/public/guard_services/')
              } else if (imagePath.includes('/guard_services/')) {
                urlParts = imagePath.split('/storage/v1/object/guard_services/')
              }
              
              if (urlParts && urlParts.length > 1) {
                filePath = urlParts[1]
                console.log('Extracted file path:', filePath)
              } else {
                console.warn('Could not extract file path from URL:', imagePath)
                continue
              }
            }
            
            // Generate fresh signed URL
            const { data: signedUrlData, error } = await supabase.storage
              .from('guard_services')
              .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days expiry
            
            if (error) {
              console.error('Error generating signed URL for', filePath, ':', error)
              continue
            } else {
              freshUrls.push(signedUrlData.signedUrl)
            }
          } catch (err) {
            console.error('Error processing image path:', imagePath, err)
            continue
          }
        }
        
        imageUrls[key] = freshUrls
      }
    }
    
    return imageUrls
  }

  // Load fresh signed URLs when component mounts or service changes
  useEffect(() => {
    const subcategories = parseSubcategories(service.sub_category)
    if (subcategories && Object.keys(subcategories).length > 0) {
      generateSignedUrls(subcategories).then(setSubcategoryImages)
    }
  }, [service.sub_category])

  // Handle fullscreen image viewing
  const openFullscreenImage = (images, index) => {
    setFullscreenImage(images)
    setCurrentImageIndex(index)
  }

  const closeFullscreenImage = () => {
    setFullscreenImage(null)
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    if (fullscreenImage && currentImageIndex < fullscreenImage.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (fullscreenImage && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (fullscreenImage) {
        if (e.key === 'Escape') {
          closeFullscreenImage()
        } else if (e.key === 'ArrowRight') {
          nextImage()
        } else if (e.key === 'ArrowLeft') {
          prevImage()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenImage, currentImageIndex])

  const serviceTypeConfig = {
    guards: { label: "Security Guards", icon: "security", color: "from-blue-500 to-cyan-500" },
    drones: { label: "Drone Services", icon: "drone", color: "from-orange-500 to-red-500" },
    agencies: { label: "Security Agencies", icon: "business", color: "from-green-500 to-emerald-500" },
    other: { label: "Other Services", icon: "more_horiz", color: "from-gray-500 to-gray-600" }
  }

  const config = serviceTypeConfig[service.service_type] || serviceTypeConfig.other
  const subcategories = parseSubcategories(service.sub_category)
  const hasSubcategories = subcategories && Object.keys(subcategories).length > 0

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await db.deleteHostService(service.id)
      if (error) {
        console.error("Error deleting service:", error)
        alert("Failed to delete service: " + error.message)
        return
      }
      
      // Success - navigate back or redirect to services list
      navigate("/dashboard/services")
    } catch (err) {
      console.error("Exception deleting service:", err)
      alert("Failed to delete service: " + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span>Back to Services</span>
        </button>
      </div>

      {/* Service Header */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Service Image */}
          <div className="md:w-1/3">
            <div className="aspect-square rounded-xl overflow-hidden shadow-2xl">
              <ServiceImageCarousel 
                images={service.images || []} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Service Info */}
          <div className="md:w-2/3 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color} shadow-lg`}>
                    <span className="material-symbols-outlined text-white text-2xl">{config.icon}</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{service.name}</h1>
                    <p className="text-white/70 text-lg">{config.label}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    service.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="text-white font-medium">{service.rating || 0}</span>
                  </div>
                </div>
            </div>

            <p className="text-white/80 text-lg leading-relaxed">{service.description}</p>

            {/* Service Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--primary-color)]">{service.total_bookings || 0}</p>
                <p className="text-white/70 text-sm">Total Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white truncate max-w-[16rem] mx-auto">
                  {service.company_name || '—'}
                </p>
                <p className="text-white/70 text-sm">Company</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{service.rating || 0}</p>
                <p className="text-white/70 text-sm">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {hasSubcategories ? Object.keys(subcategories).length : 0}
                </p>
                <p className="text-white/70 text-sm">Subcategories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories & Pricing Section */}
      {hasSubcategories && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-md"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
              <span className="material-symbols-outlined text-white">category</span>
            </span>
            Service Subcategories & Pricing
          </h2>

          {/* Debug Info */}
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <span className="material-symbols-outlined text-sm">info</span>
              <span className="font-medium">Subcategory Images Storage</span>
            </div>
            <p className="text-white/70">
              Images are stored in Supabase <code className="bg-white/10 px-1 rounded">guard_services</code> bucket and should display automatically.
              {!hasSubcategories && " No subcategories found - create a service with guard types to see images here."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(subcategories).map(([key, subcat]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                {/* Subcategory Image */}
                {subcategoryImages[key] && subcategoryImages[key].length > 0 && (
                  <div 
                    className="mb-4 rounded-lg overflow-hidden bg-white/5 cursor-pointer hover:opacity-90 transition-opacity group relative"
                    onClick={() => openFullscreenImage(subcategoryImages[key], 0)}
                  >
                    <img 
                      src={subcategoryImages[key][0]} 
                      alt={subcat.label}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        console.error('Failed to load subcategory image:', subcategoryImages[key][0])
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-32 flex items-center justify-center bg-white/5 text-white/50">
                            <span class="material-symbols-outlined">broken_image</span>
                          </div>
                        `
                      }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/0 group-hover:text-white/80 transition-colors text-2xl">
                        zoom_in
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{subcat.label}</h3>
                    {/* Image Status Indicator */}
                    <div className="flex items-center gap-2">
                      {subcategoryImages[key] && subcategoryImages[key].length > 0 ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <span className="material-symbols-outlined text-sm">image</span>
                          {subcategoryImages[key].length} images
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-400 text-xs">
                          <span className="material-symbols-outlined text-sm">image_not_supported</span>
                          No images
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Hourly Rate:</span>
                    <span className="text-[var(--primary-color)] font-bold text-lg">
                      {subcat.currency || 'INR'} {subcat.price_per_hour}/hr
                    </span>
                  </div>

                  {subcat.description && (
                    <p className="text-white/70 text-sm">{subcat.description}</p>
                  )}

                  {/* Availability */}
                  {subcat.availability !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Available:</span>
                      <span className="text-green-400 font-medium">
                        {subcat.availability} units
                      </span>
                    </div>
                  )}

                  {/* Additional Images */}
                  {subcategoryImages[key] && subcategoryImages[key].length > 1 && (
                    <div className="pt-2">
                      <p className="text-white/70 text-sm mb-2">Additional Images ({subcategoryImages[key].length - 1}):</p>
                      <div className="grid grid-cols-3 gap-2">
                        {subcategoryImages[key].slice(1, 4).map((img, idx) => (
                          <div 
                            key={idx} 
                            className="relative cursor-pointer hover:opacity-90 transition-opacity group"
                            onClick={() => openFullscreenImage(subcategoryImages[key], idx + 1)}
                          >
                            <img 
                              src={img} 
                              alt={`${subcat.label} ${idx + 2}`}
                              className="w-full h-16 object-cover rounded bg-white/5"
                              onError={(e) => {
                                console.error('Failed to load additional image:', img)
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yNCAyMEwyNCA0NEwyMiA0NEwyMiAyMEgyNFoiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTI2IDIySDQ0SDQ2VDQ2IDI0SDQ2VjQySDQ0SDI2SDI0VjIySDI2WiIgZmlsbD0iIzY2NjY2NiIvPgo8cGF0aCBkPSJNMjYgMjRIMzBIMzJIMzRIMzZIMzgyNEgzNkgzNFozMkgzMEgyNloyNFoyNFoiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+'
                              }}
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center rounded">
                              <span className="material-symbols-outlined text-white/0 group-hover:text-white/80 transition-colors text-lg">
                                zoom_in
                              </span>
                            </div>
                            {idx === 2 && subcategoryImages[key].length > 4 && (
                              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  +{subcategoryImages[key].length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Location & Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
            <span className="material-symbols-outlined text-white">location_on</span>
          </span>
          Service Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          {(service.city || service.state) && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Location</h3>
              <div className="flex items-center gap-2 text-white/80">
                <span className="material-symbols-outlined text-[var(--primary-color)]">location_on</span>
                <span>{service.city}, {service.state}</span>
              </div>
            </div>
          )}

          {/* Specializations */}
          {service.specializations && service.specializations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Specializations</h3>
              <div className="flex flex flex-wrap gap-2">
                {service.specializations.map((spec, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {service.equipment_included && service.equipment_included.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Equipment Included</h3>
              <div className="flex flex-wrap gap-2">
                {service.equipment_included.map((equipment, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full text-sm text-green-400">
                    {equipment}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => navigate(`/dashboard/services/${service.id}/edit`)}
          className="flex-1 bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] text-[#111714] py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[var(--primary-color)]/25 transition-all duration-300 ripple group"
        >
          <span className="material-symbols-outlined mr-2 group-hover:rotate-12 transition-transform">edit</span>
          Edit Service
        </button>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 bg-red-500/20 text-red-400 py-4 px-6 rounded-xl font-bold text-lg hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 ripple group disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
              Deleting...
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined mr-2 group-hover:scale-110 transition-transform">delete</span>
              Delete Service
            </>
          )}
        </button>
      </motion.div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeFullscreenImage}
        >
          {/* Close button */}
          <button
            onClick={closeFullscreenImage}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* Navigation buttons */}
          {fullscreenImage.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                disabled={currentImageIndex === 0}
                className="absolute left-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-2xl">chevron_left</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                disabled={currentImageIndex === fullscreenImage.length - 1}
                className="absolute right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-2xl">chevron_right</span>
              </button>
            </>
          )}

          {/* Image container */}
          <div 
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImage[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                console.error('Failed to load fullscreen image:', fullscreenImage[currentImageIndex])
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yNCAyMEwyNCA0NEwyMiA0NEwyMiAyMEgyNFoiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTI2IDIySDQ0SDQ2VDQ2IDI0SDQ2VjQySDQ0SDI2SDI0VjIySDI2WiIgZmlsbD0iIzY2NjY2NiIvPgo8cGF0aCBkPSJNMjYgMjRIMzBIMzJIMzRIMzZIMzgyNEgzNkgzNFozMkgzMEgyNloyNFoyNFoiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+'
              }}
            />
            
            {/* Image counter */}
            {fullscreenImage.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {fullscreenImage.length}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 text-white/70 text-sm">
            <p>Press <kbd className="bg-white/20 px-1 rounded">ESC</kbd> to close</p>
            {fullscreenImage.length > 1 && (
              <p>Use <kbd className="bg-white/20 px-1 rounded">←</kbd> <kbd className="bg-white/20 px-1 rounded">→</kbd> to navigate</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ServiceDetailView
