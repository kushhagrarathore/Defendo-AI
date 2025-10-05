import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { db } from "../lib/supabase"
import ServiceImageCarousel from "../components/ServiceImageCarousel"
import ServiceDetailView from "../components/ServiceDetailView"

const MyServices = () => {
  const navigate = useNavigate()
  const { user, hostProfile } = useAuth()
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [viewingService, setViewingService] = useState(null)
  
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

  // Service type configurations
  const serviceTypeConfig = {
    guards: { label: "Guards", icon: "security", color: "from-blue-500 to-cyan-500" },
    drones: { label: "Drones", icon: "drone", color: "from-orange-500 to-red-500" },
    agencies: { label: "Agencies", icon: "business", color: "from-green-500 to-emerald-500" },
    other: { label: "Other", icon: "more_horiz", color: "from-gray-500 to-gray-600" }
  }

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        console.log("Fetching services for user:", user.id)
        const { data, error } = await db.getHostServices(user.id)
        
        if (error) {
          console.error("Error fetching services:", error)
          setError(error.message)
          return
        }
        
        console.log("Services fetched successfully:", data)
        setServices(data || [])
        
      } catch (err) {
        console.error("Exception fetching services:", err)
        setError(err.message || 'Failed to fetch services')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [user])

  const handleDelete = async (serviceId) => {
    setIsDeleting(true)
    
    try {
      console.log("Deleting service:", serviceId)
      const { error } = await db.deleteHostService(serviceId)
      
      if (error) {
        console.error("Error deleting service:", error)
        setError(error.message)
        return
      }
      
      // Remove from local state
      setServices(prev => prev.filter(s => s.id !== serviceId))
      setSelectedService(null)
      console.log("Service deleted successfully")
      
    } catch (err) {
      console.error("Exception deleting service:", err)
      setError(err.message || 'Failed to delete service')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleActive = async (service) => {
    const next = !service.is_active
    const message = next
      ? 'Activate this service? It will become visible to customers.'
      : 'Deactivate this service? It will be hidden from customers.'
    const warn = next
      ? '\n\nWarning: Make sure pricing and details are correct before activating.'
      : '\n\nWarning: Existing bookings are unaffected; new bookings will be disabled.'
    if (!window.confirm(message + warn)) return

    try {
      setTogglingId(service.id)
      // optimistic UI
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: next } : s))
      const { error } = await db.updateHostService(service.id, { is_active: next })
      if (error) {
        // rollback
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: service.is_active } : s))
        console.error('Toggle active failed:', error)
        alert('Failed to update status: ' + (error.message || 'Unknown error'))
      } else {
        // notify other pages (e.g., Dashboard) to refresh
        window.dispatchEvent(new CustomEvent('services:changed', { detail: { id: service.id, is_active: next } }))
      }
    } finally {
      setTogglingId(null)
    }
  }

  const handleServiceClick = (service) => {
    setViewingService(service)
  }

  const handleBackToServices = () => {
    setViewingService(null)
  }

  // Calculate stats
  const totalServices = services.length
  const activeServices = services.filter(s => s.is_active).length
  const totalBookings = services.reduce((sum, s) => sum + (s.total_bookings || 0), 0)
  const avgRating = services.length > 0 
    ? (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1)
    : 0

  // Show detailed service view if a service is selected
  if (viewingService) {
    return (
      <ServiceDetailView
        service={viewingService}
        onBack={handleBackToServices}
        onEdit={(serviceId) => navigate(`/dashboard/services/${serviceId}/edit`)}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
          <h1 className="text-4xl font-bold gradient-text animate-slide-in-left">My Services</h1>
          <p className="text-white/70 mt-2 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            Manage your security service offerings
          </p>
        </div>
        <Link 
          to="/dashboard/add-service"
          className="group bg-gradient-to-r from-[var(--primary-color)] via-emerald-400 to-[#2a5a3a] text-[#111714] px-7 py-3.5 rounded-full font-bold shadow-[0_10px_30px_rgba(74,222,128,0.25)] hover:shadow-[0_18px_40px_rgba(74,222,128,0.35)] transition-all duration-300 ripple animate-slide-in-right"
        >
          <span className="material-symbols-outlined mr-2 group-hover:rotate-90 transition-transform duration-300">add</span>
          Add New Service
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm animate-slide-in-top">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400">error</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/70">Loading services...</p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)] card-animate hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <span className="material-symbols-outlined text-white">security</span>
              </div>
              <div>
                <p className="text-white/70 text-sm">Total Services</p>
                <p className="text-2xl font-bold text-white">{totalServices}</p>
              </div>
            </div>
            </div>
            
          <div className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)] card-animate hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <span className="material-symbols-outlined text-white">check_circle</span>
              </div>
              <div>
                <p className="text-white/70 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{activeServices}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)] card-animate hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <span className="material-symbols-outlined text-white">event</span>
              </div>
              <div>
                <p className="text-white/70 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{totalBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)] card-animate hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <span className="material-symbols-outlined text-white">star</span>
              </div>
              <div>
                <p className="text-white/70 text-sm">Avg Rating</p>
                <p className="text-2xl font-bold text-white">{avgRating}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && (
        <>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary-color)] to-[#2a5a3a] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[#111714] text-4xl">security</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Services Yet</h3>
              <p className="text-white/70 mb-6">Start by adding your first security service offering</p>
              <Link 
                to="/dashboard/add-service"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] text-[#111714] px-6 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-[var(--primary-color)]/25 transition-all duration-300 ripple"
              >
                <span className="material-symbols-outlined">add</span>
                Add Your First Service
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const config = serviceTypeConfig[service.service_type] || serviceTypeConfig.other
                const performance = Math.min((service.total_bookings / 20) * 100, 100)
                const subcategories = parseSubcategories(service.sub_category)
                const hasSubcategories = subcategories && Object.keys(subcategories).length > 0
                
                const companyName = hostProfile?.company_name || hostProfile?.full_name || (user?.email ? user.email.split('@')[0] : 'Host')

                return (
                  <motion.div 
                    key={service.id} 
                    className="group relative overflow-hidden rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md card-animate stagger-item hover:shadow-2xl hover:shadow-[var(--primary-color)]/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                    style={{animationDelay: `${index * 0.1}s`}}
                    onClick={(e) => {
                      // Don't trigger on button clicks
                      if (!e.target.closest('button')) {
                        handleServiceClick(service)
                      }
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Background Pattern */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Image Carousel */}
                      <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
                        <ServiceImageCarousel 
                          images={service.images || []} 
                          className="w-full"
                        />
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${config.color} shadow-lg`}>
                            <span className="material-symbols-outlined text-white text-xl">{config.icon}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white group-hover:text-[var(--primary-color)] transition-colors">
                            {service.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(service)}
                            disabled={togglingId === service.id}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              service.is_active 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            } ${togglingId === service.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                            title={service.is_active ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {togglingId === service.id ? 'Updating...' : (service.is_active ? 'Active' : 'Inactive')}
                          </button>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                            <span className="text-white text-sm font-medium">{service.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-white/70 mb-6 leading-relaxed">{service.description}</p>
                      
                      {/* Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Type:</span>
                          <span className="text-white font-medium">{config.label}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Company:</span>
                          <span className="text-white font-medium">{companyName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Bookings:</span>
                          <span className="text-white font-medium">{service.total_bookings || 0}</span>
                        </div>
                        {(service.city && service.state) && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm">Location:</span>
                            <span className="text-white font-medium">{service.city}, {service.state}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Specializations */}
                      {service.specializations && service.specializations.length > 0 && (
                        <div className="mb-4">
                          <p className="text-white/70 text-sm mb-2">Specializations:</p>
                          <div className="flex flex-wrap gap-1">
                            {service.specializations.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                                {spec}
                              </span>
                            ))}
                            {service.specializations.length > 3 && (
                              <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                                +{service.specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Subcategories (from sub_category JSON string) */}
                      {(() => {
                        const subObj = parseSubcategories(service.sub_category)
                        return subObj && Object.keys(subObj).length > 0
                      })() && (
                        <div className="mb-4">
                          <p className="text-white/70 text-sm mb-2">Subcategories & Pricing:</p>
                          <div className="space-y-2">
                            {Object.entries(parseSubcategories(service.sub_category)).map(([key, subcat]) => (
                              <div key={key} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                                <span className="text-white text-sm font-medium">{subcat.label}</span>
                                <span className="text-[var(--primary-color)] font-bold text-sm">
                                  {subcat.currency} {subcat.price_per_hour}/hr
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-white/70 mb-2">
                          <span>Performance</span>
                          <span>{Math.round(performance)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className={`h-2 bg-gradient-to-r ${config.color} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${performance}%` }}
                          ></div>
              </div>
            </div>
            
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleServiceClick(service)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ripple group ${
                            hasSubcategories 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/25' 
                              : 'bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] text-[#111714] hover:shadow-lg hover:shadow-[var(--primary-color)]/25'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-sm mr-1 group-hover:scale-110 transition-transform ${
                            hasSubcategories ? 'text-white' : ''
                          }`}>
                            {hasSubcategories ? 'visibility' : 'add'}
                          </span>
                          {hasSubcategories ? 'View Details' : 'View Service'}
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/dashboard/services/${service.id}/edit`)
                          }} 
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 ripple group"
                        >
                          <span className="material-symbols-outlined text-sm mr-1 group-hover:rotate-12 transition-transform">edit</span>
                          Edit
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedService(service)
                          }}
                          className="flex-1 bg-red-500/20 text-red-400 py-2 px-4 rounded-lg font-medium hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 ripple group"
                        >
                          <span className="material-symbols-outlined text-sm mr-1 group-hover:scale-110 transition-transform">delete</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-2xl p-6 border border-[#29382f] max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-400 text-2xl">warning</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Service</h3>
              <p className="text-white/70 mb-6">
                Are you sure you want to delete "{selectedService.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedService(null)}
                  className="flex-1 bg-[#29382f] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#3a4a3f] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedService.id)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 ripple"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
      </div>
      )}
    </div>
  )
}

export default MyServices
