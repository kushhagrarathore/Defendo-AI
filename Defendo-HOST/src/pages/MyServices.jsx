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
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-[var(--primary-color)] bg-clip-text text-transparent mb-4">
            My Services
          </h1>
          <p className="text-slate-600 text-lg">Manage your security service offerings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-500">error</span>
              <p className="text-rose-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500">Loading services...</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Total Services */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 bg-white border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-100 rounded-2xl shadow-sm border border-slate-200">
                  <span className="material-symbols-outlined text-slate-700 text-2xl">security</span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Services</p>
                  <p className="text-3xl font-bold text-slate-900">{totalServices}</p>
                </div>
              </div>
            </motion.div>
            
            {/* Active Services */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 bg-white border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100">
                  <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-slate-900">{activeServices}</p>
                </div>
              </div>
            </motion.div>
            
            {/* Total Bookings */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6 bg-white border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-sky-50 rounded-2xl shadow-sm border border-sky-100">
                  <span className="material-symbols-outlined text-sky-600 text-2xl">event</span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-slate-900">{totalBookings}</p>
                </div>
              </div>
            </motion.div>
            
            {/* Average Rating */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-6 bg-white border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-50 rounded-2xl shadow-sm border border-amber-100">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">star</span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Avg Rating</p>
                  <p className="text-3xl font-bold text-slate-900">{avgRating}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Services Grid */}
        {!isLoading && (
          <>
            {services.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-[var(--primary-color)] to-sky-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-300/40">
                  <span className="material-symbols-outlined text-white text-5xl">security</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">No Services Yet</h3>
                <p className="text-slate-500 mb-8 text-lg">Start by adding your first security service offering</p>
                <Link 
                  to="/dashboard/add-service"
                  className="inline-flex items-center gap-3 bg-[var(--primary-color)] text-[#0f172a] px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:shadow-emerald-300/40 transition-all duration-300 hover:scale-105"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  Add Your First Service
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const config = serviceTypeConfig[service.service_type] || serviceTypeConfig.other
                const performance = Math.min((service.total_bookings / 20) * 100, 100)
                const subcategories = parseSubcategories(service.sub_category)
                const hasSubcategories = subcategories && Object.keys(subcategories).length > 0
                
                const companyName = hostProfile?.company_name || hostProfile?.full_name || (user?.email ? user.email.split('@')[0] : 'Host')

                return (
                  <motion.div 
                    key={service.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)] transition-all duration-300 cursor-pointer"
                    onClick={(e) => {
                      // Don't trigger on button clicks
                      if (!e.target.closest('button')) {
                        handleServiceClick(service)
                      }
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        service.is_active 
                          ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Service Image */}
                      <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                        <ServiceImageCarousel 
                          images={service.images || []} 
                          className="w-full h-48 object-cover"
                        />
                      </div>

                      {/* Service Header */}
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-[var(--primary-color)] transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                      </div>
                      
                      {/* Information Blocks */}
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500 text-sm font-medium">Type:</span>
                          <span className="text-slate-900 font-semibold">{config.label}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500 text-sm font-medium">Company:</span>
                          <span className="text-slate-900 font-semibold">{companyName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500 text-sm font-medium">Bookings:</span>
                          <span className="text-slate-900 font-semibold">{service.total_bookings || 0}</span>
                        </div>
                        {(service.city && service.state) && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-sm font-medium">Location:</span>
                            <span className="text-slate-900 font-semibold">{service.city}, {service.state}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Specializations */}
                      {service.specializations && service.specializations.length > 0 && (
                        <div className="mb-6">
                          <p className="text-slate-500 text-sm mb-3 font-medium">Specializations:</p>
                          <div className="flex flex-wrap gap-2">
                            {service.specializations.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="px-3 py-1 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/40 rounded-full text-xs text-[var(--primary-color)] font-medium">
                                {spec}
                              </span>
                            ))}
                            {service.specializations.length > 3 && (
                              <span className="px-3 py-1 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/40 rounded-full text-xs text-[var(--primary-color)] font-medium">
                                +{service.specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Subcategories & Pricing */}
                      {(() => {
                        const subObj = parseSubcategories(service.sub_category)
                        return subObj && Object.keys(subObj).length > 0
                      })() && (
                        <div className="mb-6">
                          <p className="text-slate-500 text-sm mb-3 font-medium">Subcategories & Pricing:</p>
                          <div className="space-y-2">
                            {Object.entries(parseSubcategories(service.sub_category)).map(([key, subcat]) => (
                              <div key={key} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                <span className="text-slate-900 text-sm font-semibold">{subcat.label}</span>
                                <span className="text-[var(--primary-color)] font-bold text-sm">
                                  {subcat.currency} {subcat.price_per_hour}/hr
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Performance Bar */}
                      <div className="mb-8">
                        <div className="flex justify-between text-sm text-slate-500 mb-3">
                          <span className="font-medium">Performance</span>
                          <span className="font-bold text-[var(--primary-color)]">{Math.round(performance)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className="h-3 bg-gradient-to-r from-[var(--primary-color)] to-sky-400 rounded-full shadow-lg shadow-emerald-200/60"
                            initial={{ width: 0 }}
                            animate={{ width: `${performance}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
            
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleServiceClick(service)}
                          className="flex-1 bg-slate-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-400/40 transition-all duration-300 hover:scale-105 group border border-slate-900"
                        >
                          <span className="material-symbols-outlined text-sm mr-2 group-hover:scale-110 transition-transform">visibility</span>
                          View Details
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/dashboard/services/${service.id}/edit`)
                          }} 
                          className="flex-1 bg-amber-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-300/40 transition-all duration-300 hover:scale-105 group border border-amber-400"
                        >
                          <span className="material-symbols-outlined text-sm mr-2 group-hover:rotate-12 transition-transform">edit</span>
                          Edit
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedService(service)
                          }}
                          className="flex-1 bg-rose-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-300/40 transition-all duration-300 hover:scale-105 group border border-rose-400"
                        >
                          <span className="material-symbols-outlined text-sm mr-2 group-hover:scale-110 transition-transform">delete</span>
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

        {/* Floating Add Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link 
            to="/dashboard/add-service"
            className="group bg-[var(--primary-color)] text-[#0f172a] px-6 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:shadow-emerald-300/40 transition-all duration-300 hover:scale-110 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
            <span className="hidden sm:block">Add New Service</span>
          </Link>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 border border-rose-200 max-w-md w-full mx-4 shadow-[0_18px_60px_rgba(15,23,42,0.25)]"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-rose-500 text-3xl">warning</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Delete Service</h3>
                <p className="text-slate-600 mb-8 text-lg">
                  Are you sure you want to delete "{selectedService.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="flex-1 bg-slate-100 text-slate-800 py-3 px-6 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(selectedService.id)}
                    disabled={isDeleting}
                    className="flex-1 bg-rose-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-300/40 transition-all duration-300 disabled:opacity-50"
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
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyServices
