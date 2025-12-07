import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import BookingModal from '../components/BookingModal'
import Toast from '../components/Toast'

const Services = () => {
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
  const [filters, setFilters] = useState({
    search: '',
    serviceType: 'all',
    location: 'all',
    sortBy: 'rating' // rating, price_low, price_high
  })

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [services, filters])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('host_services')
        .select(`
          *,
          host_profiles!host_services_host_id_fkey(
            id,
            full_name,
            company_name,
            rating,
            verified
          )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })

      if (error) {
        console.error('Error fetching services:', error)
        // Try without the join if it fails
        const { data: simpleData, error: simpleError } = await supabase
          .from('host_services')
          .select('*')
          .eq('is_active', true)
          .order('rating', { ascending: false })
        
        if (simpleError) throw simpleError
        setServices(simpleData || [])
        setFilteredServices(simpleData || [])
        return
      }

      setServices(data || [])
      setFilteredServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...services]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (service) =>
          service.name?.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower) ||
          service.location?.toLowerCase().includes(searchLower) ||
          service.host_profiles?.company_name?.toLowerCase().includes(searchLower)
      )
    }

    // Service type filter
    if (filters.serviceType !== 'all') {
      filtered = filtered.filter((service) => service.service_type === filters.serviceType)
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter((service) => service.location === filters.location)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return (a.price_per_hour || 0) - (b.price_per_hour || 0)
        case 'price_high':
          return (b.price_per_hour || 0) - (a.price_per_hour || 0)
        case 'rating':
        default:
          return (b.rating || 0) - (a.rating || 0)
      }
    })

    setFilteredServices(filtered)
  }

  const handleBookService = (service) => {
    setSelectedService(service)
    setIsBookingModalOpen(true)
  }

  const handleBookingSuccess = () => {
    setIsBookingModalOpen(false)
    setSelectedService(null)
    setToast({
      isVisible: true,
      message: 'Booking request submitted successfully! The provider will review and confirm.',
      type: 'success'
    })
    // Refresh services to update booking counts
    fetchServices()
  }

  const getServiceTypeIcon = (type) => {
    const icons = {
      securityGuard: 'security',
      dronePatrol: 'flight',
      patrol: 'patrol',
      surveillance: 'videocam',
      eventSecurity: 'event',
      bodyguard: 'person',
      other: 'more_horiz'
    }
    return icons[type] || 'security'
  }

  const getServiceTypeLabel = (type) => {
    const labels = {
      securityGuard: 'Security Guard',
      dronePatrol: 'Drone Patrol',
      patrol: 'Patrol',
      surveillance: 'Surveillance',
      eventSecurity: 'Event Security',
      bodyguard: 'Bodyguard',
      other: 'Other'
    }
    return labels[type] || type
  }

  const uniqueLocations = [...new Set(services.map((s) => s.location).filter(Boolean))].sort()
  const uniqueServiceTypes = [...new Set(services.map((s) => s.service_type).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold">Available Services</h1>
        <p className="text-white/70 text-lg">
          Browse and book security services from verified providers
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1a241e] border border-[#29382f] rounded-2xl p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white/70 mb-2">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                search
              </span>
              <input
                type="text"
                placeholder="Search services, locations, providers..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white placeholder-white/40 focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              />
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            >
              <option value="all">All Types</option>
              {uniqueServiceTypes.map((type) => (
                <option key={type} value={type}>
                  {getServiceTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-white/70">Sort by:</label>
          <div className="flex gap-2">
            {[
              { value: 'rating', label: 'Rating' },
              { value: 'price_low', label: 'Price: Low to High' },
              { value: 'price_high', label: 'Price: High to Low' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters({ ...filters, sortBy: option.value })}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filters.sortBy === option.value
                    ? 'bg-[var(--primary-color)] text-[#111714] font-semibold'
                    : 'bg-[#111714] text-white/70 hover:text-white hover:bg-white/5 border border-[#29382f]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-[#1a241e] border border-[#29382f] rounded-2xl"
        >
          <span className="material-symbols-outlined text-6xl text-white/20 mb-4">search_off</span>
          <p className="text-white/70 text-lg">No services found matching your criteria</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-[#1a241e] border border-[#29382f] rounded-2xl p-6 hover:border-[var(--primary-color)]/30 transition-all duration-300 group cursor-pointer"
            >
              {/* Service Image/Icon */}
              <div className="mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--primary-color)]/5 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-6xl text-[var(--primary-color)]">
                    {getServiceTypeIcon(service.service_type)}
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--primary-color)] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-white/60 mt-1">
                      {getServiceTypeLabel(service.service_type)}
                    </p>
                  </div>
                  {service.host_profiles?.verified && (
                    <span className="material-symbols-outlined text-[var(--primary-color)]" title="Verified Provider">
                      verified
                    </span>
                  )}
                </div>

                <p className="text-white/70 text-sm line-clamp-2">{service.description}</p>

                {/* Provider Info */}
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="material-symbols-outlined text-base">business</span>
                  <span>{service.host_profiles?.company_name || service.host_profiles?.full_name || 'Provider'}</span>
                </div>

                {/* Location */}
                {service.location && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>{service.location}</span>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined text-base ${
                          i < Math.floor(service.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-white/20'
                        }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-white/70">
                    {service.rating?.toFixed(1) || '0.0'} ({service.total_bookings || 0} bookings)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t border-[#29382f]">
                  <div>
                    <span className="text-2xl font-bold text-[var(--primary-color)]">
                      {service.currency || 'INR'} {service.price_per_hour || 0}
                    </span>
                    <span className="text-sm text-white/60 ml-1">/hour</span>
                  </div>
                </div>

                {/* Specializations */}
                {service.specializations && service.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.specializations.slice(0, 3).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg border border-[var(--primary-color)]/20"
                      >
                        {spec}
                      </span>
                    ))}
                    {service.specializations.length > 3 && (
                      <span className="px-2 py-1 text-xs text-white/60">
                        +{service.specializations.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Book Button */}
                <motion.button
                  onClick={() => handleBookService(service)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-3 rounded-xl bg-[var(--primary-color)] text-[#111714] font-semibold hover:bg-[var(--primary-color)]/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">book_online</span>
                  <span>Book Now</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && selectedService && (
        <BookingModal
          service={selectedService}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedService(null)
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}

export default Services

