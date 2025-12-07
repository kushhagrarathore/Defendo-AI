import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const BookingModal = ({ service, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    booking_date: '',
    start_time: '',
    end_time: '',
    location: service?.location || '',
    client_notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [calculatedPrice, setCalculatedPrice] = useState(0)

  const calculatePrice = () => {
    if (!formData.start_time || !formData.end_time || !service?.price_per_hour) {
      setCalculatedPrice(0)
      return
    }

    const start = new Date(`2000-01-01T${formData.start_time}`)
    const end = new Date(`2000-01-01T${formData.end_time}`)
    
    if (end <= start) {
      setCalculatedPrice(0)
      return
    }

    const diffMs = end - start
    const diffHours = diffMs / (1000 * 60 * 60)
    const price = diffHours * (service.price_per_hour || 0)
    setCalculatedPrice(price)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    
    if (name === 'start_time' || name === 'end_time') {
      setTimeout(calculatePrice, 100)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.booking_date || !formData.start_time || !formData.end_time) {
      setError('Please fill in all required fields')
      return
    }

    if (!user) {
      setError('You must be logged in to book a service')
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate duration in hours
      const start = new Date(`2000-01-01T${formData.start_time}`)
      const end = new Date(`2000-01-01T${formData.end_time}`)
      const diffMs = end - start
      const durationHours = Math.ceil(diffMs / (1000 * 60 * 60))

      if (durationHours <= 0) {
        throw new Error('End time must be after start time')
      }

      // Create booking
      const bookingData = {
        client_id: user.id,
        host_id: service.host_id,
        service_type: service.service_type,
        booking_date: formData.booking_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        duration_hours: durationHours,
        location: formData.location,
        price: calculatedPrice,
        currency: service.currency || 'INR',
        client_notes: formData.client_notes,
        status: 'pending',
        payment_status: 'pending'
      }

      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (bookingError) throw bookingError

      // Send notification to host
      try {
        await supabase.from('notifications').insert({
          user_id: service.host_id,
          type: 'new_booking',
          title: 'New Booking Received',
          message: `A new ${service.name} booking request has been made for ${formData.booking_date}.`
        })
      } catch (notifErr) {
        console.warn('Failed to send notification:', notifErr)
      }

      onSuccess()
    } catch (err) {
      console.error('Booking error:', err)
      setError(err.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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

  // Calculate price when times change
  useEffect(() => {
    calculatePrice()
  }, [formData.start_time, formData.end_time])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1a241e] border border-[#29382f] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-[#1a241e] border-b border-[#29382f] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Book Service</h2>
                  <p className="text-white/60 text-sm mt-1">{service?.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-white/70">close</span>
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Service Info */}
                <div className="bg-[#111714] border border-[#29382f] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Service Type</span>
                    <span className="text-white font-semibold">
                      {getServiceTypeLabel(service?.service_type)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Provider</span>
                    <span className="text-white font-semibold">
                      {service?.host_profiles?.company_name || service?.host_profiles?.full_name || 'Provider'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Price per Hour</span>
                    <span className="text-[var(--primary-color)] font-semibold">
                      {service?.currency || 'INR'} {service?.price_per_hour || 0}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Booking Date */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Booking Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="booking_date"
                    value={formData.booking_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Start Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      End Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter service location"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white placeholder-white/40 focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="client_notes"
                    value={formData.client_notes}
                    onChange={handleChange}
                    placeholder="Any special requirements or instructions..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white placeholder-white/40 focus:outline-none focus:border-[var(--primary-color)] transition-colors resize-none"
                  />
                </div>

                {/* Price Summary */}
                {calculatedPrice > 0 && (
                  <div className="bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Estimated Total</span>
                      <span className="text-2xl font-bold text-[var(--primary-color)]">
                        {service?.currency || 'INR'} {calculatedPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs">
                      Based on selected time duration
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl bg-[#111714] border border-[#29382f] text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || calculatedPrice <= 0}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="flex-1 px-6 py-3 rounded-xl bg-[var(--primary-color)] text-[#111714] font-semibold hover:bg-[var(--primary-color)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#111714] border-t-transparent rounded-full animate-spin"></div>
                        <span>Booking...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">check_circle</span>
                        <span>Confirm Booking</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BookingModal

