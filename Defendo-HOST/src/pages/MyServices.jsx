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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  
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

  // Filter and sort services
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.state?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterType === "all" || 
      (filterType === "active" && service.is_active) ||
      (filterType === "inactive" && !service.is_active) ||
      service.service_type === filterType
    
    return matchesSearch && matchesFilter
  })

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch(sortBy) {
      case "recent":
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      case "bookings":
        return (b.total_bookings || 0) - (a.total_bookings || 0)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "name":
        return (a.service_name || "").localeCompare(b.service_name || "")
      default:
        return 0
    }
  })

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-[var(--primary-color)] bg-clip-text text-transparent mb-3">
                My Services
              </h1>
              <p className="text-slate-600 text-base md:text-lg">Manage and monitor your security service offerings</p>
            </div>
            <Link 
              to="/dashboard/add-service"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary-color)] to-emerald-500 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-emerald-300/50 transition-all duration-300 hover:scale-105 group"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
              Add New Service
            </Link>
          </div>

          {/* Search and Filter Bar */}
          {services.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200/60 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    type="text"
                    placeholder="Search services by name, location, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all bg-slate-50/50"
                  />
                </div>
                
                {/* Filter */}
                <div className="flex gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all bg-white font-medium text-slate-700"
                  >
                    <option value="all">All Services</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                    <option value="guards">Guards</option>
                    <option value="drones">Drones</option>
                    <option value="agencies">Agencies</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all bg-white font-medium text-slate-700"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="bookings">Most Bookings</option>
                    <option value="rating">Highest Rating</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
              
              {/* Results Count */}
              {searchQuery || filterType !== "all" ? (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Showing <span className="font-bold text-slate-900">{sortedServices.length}</span> of <span className="font-bold text-slate-900">{services.length}</span> services
                  </p>
                </div>
              ) : null}
            </div>
          )}
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

        {/* Enhanced Stats Overview */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-10">
            {/* Total Services */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-lg hover:shadow-2xl hover:shadow-blue-200/30 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Services</p>
                  <p className="text-4xl font-extrabold text-slate-900 mb-1">{totalServices}</p>
                  <p className="text-xs text-slate-400">All time</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">security</span>
                </div>
              </div>
            </motion.div>
            
            {/* Active Services */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-200/80 shadow-lg hover:shadow-2xl hover:shadow-emerald-200/30 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">Active Services</p>
                  <p className="text-4xl font-extrabold text-slate-900 mb-1">{activeServices}</p>
                  <p className="text-xs text-slate-400">{totalServices > 0 ? Math.round((activeServices/totalServices)*100) : 0}% of total</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
                </div>
              </div>
            </motion.div>
            
            {/* Total Bookings */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-sky-50/50 border border-sky-200/80 shadow-lg hover:shadow-2xl hover:shadow-sky-200/30 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-100/50 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sky-600 text-xs font-semibold uppercase tracking-wider mb-2">Total Bookings</p>
                  <p className="text-4xl font-extrabold text-slate-900 mb-1">{totalBookings.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">All services</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">event</span>
                </div>
              </div>
            </motion.div>
            
            {/* Average Rating */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-amber-50/50 border border-amber-200/80 shadow-lg hover:shadow-2xl hover:shadow-amber-200/30 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">Avg Rating</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-4xl font-extrabold text-slate-900">{avgRating}</p>
                    <span className="material-symbols-outlined text-amber-500 text-xl">star</span>
                  </div>
                  <p className="text-xs text-slate-400">Customer feedback</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">star</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Services Grid */}
        {!isLoading && (
          <>
            {services.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-300 shadow-lg"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-[var(--primary-color)] via-emerald-400 to-sky-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-300/40 animate-pulse">
                  <span className="material-symbols-outlined text-white text-5xl">security</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-3">No Services Yet</h3>
                <p className="text-slate-500 mb-8 text-lg max-w-md mx-auto">Start by adding your first security service offering and begin receiving bookings</p>
                <Link 
                  to="/dashboard/add-service"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[var(--primary-color)] to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:shadow-emerald-300/40 transition-all duration-300 hover:scale-105"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  Add Your First Service
                </Link>
              </motion.div>
            ) : sortedServices.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-lg">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Services Found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType("all")
                  }}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedServices.map((service, index) => {
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
                    transition={{ delay: index * 0.05 }}
                    className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-2xl hover:shadow-blue-200/20 transition-all duration-300 cursor-pointer"
                    onClick={(e) => {
                      // Don't trigger on button clicks
                      if (!e.target.closest('button')) {
                        handleServiceClick(service)
                      }
                    }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    {/* Active Badge */}
                    <div className="absolute top-5 right-5 z-20">
                      <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                        service.is_active 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-emerald-400' 
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${service.is_active ? 'bg-white' : 'bg-slate-400'} animate-pulse`}></span>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Service Type Badge */}
                    <div className="absolute top-5 left-5 z-20">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${config.color}`}>
                        {config.label}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Service Image */}
                      <div className="mb-6 rounded-2xl overflow-hidden shadow-xl border border-slate-100 group-hover:shadow-2xl transition-all duration-300">
                        <ServiceImageCarousel 
                          images={service.images || []} 
                          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Service Header */}
                      <div className="mb-5">
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">
                          {service.service_name || service.name || "Unnamed Service"}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{service.description || "No description available"}</p>
                      </div>
                      
                      {/* Rating and Bookings */}
                      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-amber-500 text-lg">star</span>
                          <span className="font-bold text-slate-900">{(service.rating || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="material-symbols-outlined text-base">event</span>
                          <span className="text-sm font-medium">{service.total_bookings || 0} bookings</span>
                        </div>
                        {(service.city && service.state) && (
                          <div className="flex items-center gap-1.5 text-slate-500 ml-auto">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            <span className="text-xs font-medium">{service.city}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 font-medium mb-1">Company</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{companyName}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 font-medium mb-1">Price</p>
                          <p className="text-sm font-bold text-[var(--primary-color)]">
                            ₹{service.price_per_hour || service.price || "N/A"}
                            {service.price_per_hour ? "/hr" : ""}
                          </p>
                        </div>
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
                      <div className="mb-6">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="font-semibold text-slate-600">Performance Score</span>
                          <span className="font-bold text-[var(--primary-color)]">{Math.round(performance)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-[var(--primary-color)] via-emerald-400 to-sky-400 rounded-full shadow-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${performance}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
            
                      {/* Action Buttons */}
                      <div className="flex gap-2.5">
                        <button 
                          onClick={() => handleServiceClick(service)}
                          className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white py-3 px-4 rounded-xl font-bold hover:from-slate-800 hover:to-slate-700 hover:shadow-xl hover:shadow-slate-400/40 transition-all duration-300 hover:scale-105 group border border-slate-700 text-sm"
                        >
                          <span className="material-symbols-outlined text-base mr-1.5 group-hover:scale-110 transition-transform inline-block">visibility</span>
                          View
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/dashboard/services/${service.id}/edit`)
                          }} 
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-xl font-bold hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-300/40 transition-all duration-300 hover:scale-105 group border border-amber-400 text-sm"
                        >
                          <span className="material-symbols-outlined text-base mr-1.5 group-hover:rotate-12 transition-transform inline-block">edit</span>
                          Edit
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleActive(service)
                          }}
                          disabled={togglingId === service.id}
                          className={`px-4 py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 group border text-sm ${
                            service.is_active
                              ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 border-rose-400 hover:shadow-rose-300/40'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 border-emerald-400 hover:shadow-emerald-300/40'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform inline-block">
                            {service.is_active ? 'toggle_on' : 'toggle_off'}
                          </span>
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedService(service)
                          }}
                          className="px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-bold hover:from-rose-600 hover:to-rose-700 hover:shadow-xl hover:shadow-rose-300/40 transition-all duration-300 hover:scale-105 group border border-rose-400 text-sm"
                        >
                          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">delete</span>
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
                  Are you sure you want to delete "{selectedService.service_name || selectedService.name || "this service"}"? This action cannot be undone.
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
