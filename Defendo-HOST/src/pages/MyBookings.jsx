import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const MyBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user, filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('bookings')
        .select(`
          *,
          host_profiles!bookings_host_id_fkey(
            id,
            full_name,
            company_name,
            rating,
            verified
          )
        `)
        .eq('client_id', user.id)

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error with join, trying without:', error)
        // Fallback: query without join
        let fallbackQuery = supabase
          .from('bookings')
          .select('*')
          .eq('client_id', user.id)
        
        if (filter !== 'all') {
          fallbackQuery = fallbackQuery.eq('status', filter)
        }
        
        fallbackQuery = fallbackQuery.order('created_at', { ascending: false })
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        
        if (fallbackError) throw fallbackError
        setBookings(fallbackData || [])
        return
      }

      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      completed: 'bg-green-500/10 text-green-400 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'schedule',
      confirmed: 'check_circle',
      completed: 'done_all',
      cancelled: 'cancel'
    }
    return icons[status] || 'schedule'
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading bookings...</p>
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold">My Bookings</h1>
          <p className="text-white/70 text-lg mt-2">
            View and manage your service bookings
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {[
          { value: 'all', label: 'All Bookings' },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              filter === option.value
                ? 'bg-[var(--primary-color)] text-[#111714] font-semibold'
                : 'bg-[#1a241e] text-white/70 hover:text-white hover:bg-white/5 border border-[#29382f]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </motion.div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-[#1a241e] border border-[#29382f] rounded-2xl"
        >
          <span className="material-symbols-outlined text-6xl text-white/20 mb-4">calendar_today</span>
          <p className="text-white/70 text-lg">No bookings found</p>
          <p className="text-white/50 text-sm mt-2">
            {filter === 'all' ? 'You haven\'t made any bookings yet' : `No ${filter} bookings`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#1a241e] border border-[#29382f] rounded-2xl p-6 hover:border-[var(--primary-color)]/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {getServiceTypeLabel(booking.service_type)}
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        {booking.host_profiles?.company_name || booking.host_profiles?.full_name || 'Provider'}
                        {booking.host_profiles?.verified && (
                          <span className="ml-2 material-symbols-outlined text-[var(--primary-color)] text-sm align-middle" title="Verified Provider">
                            verified
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium border flex items-center gap-1 ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {getStatusIcon(booking.status)}
                      </span>
                      <span className="capitalize">{booking.status}</span>
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      <span>{formatDate(booking.booking_date || booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </span>
                    </div>
                    {booking.duration_hours && (
                      <div className="flex items-center gap-2 text-white/70">
                        <span className="material-symbols-outlined text-base">timer</span>
                        <span>{booking.duration_hours} hour{booking.duration_hours !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {booking.location && (
                      <div className="flex items-center gap-2 text-white/70">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span>{booking.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {booking.client_notes && (
                    <div className="bg-[#111714] border border-[#29382f] rounded-lg p-3">
                      <p className="text-white/60 text-sm">
                        <span className="font-medium text-white/80">Notes: </span>
                        {booking.client_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-end gap-3 md:min-w-[200px]">
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-white/60 text-sm">Total Price</p>
                    <p className="text-2xl font-bold text-[var(--primary-color)]">
                      {booking.currency || 'INR'} {booking.price || 0}
                    </p>
                  </div>

                  {/* Payment Status */}
                  {booking.payment_status && (
                    <div className="text-right">
                      <p className="text-white/60 text-sm">Payment</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.payment_status === 'paid'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : booking.payment_status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {booking.payment_status}
                      </span>
                    </div>
                  )}

                  {/* Booking Date */}
                  <div className="text-right text-white/50 text-xs">
                    Booked on {formatDate(booking.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings

