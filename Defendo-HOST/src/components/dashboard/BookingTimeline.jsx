import { motion, AnimatePresence } from 'framer-motion'

const BookingTimeline = ({ bookings = [] }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'confirmed': return 'text-blue-400 bg-blue-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'cancelled': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check_circle'
      case 'confirmed': return 'event_available'
      case 'pending': return 'pending'
      case 'cancelled': return 'cancel'
      default: return 'help'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `${diffDays} days from now`
    return date.toLocaleDateString()
  }

  const sampleBookings = bookings.length > 0 ? bookings : [
    {
      id: 1,
      service_type: 'guards',
      status: 'confirmed',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      time: '14:00',
      location: 'Indore, MP',
      price: 2500
    },
    {
      id: 2,
      service_type: 'drones',
      status: 'pending',
      date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      time: '10:00',
      location: 'Bhopal, MP',
      price: 5000
    },
    {
      id: 3,
      service_type: 'studios',
      status: 'completed',
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      time: '16:00',
      location: 'Gwalior, MP',
      price: 8000
    }
  ]

  return (
    <motion.div
      className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Booking Timeline</h2>
        <motion.button
          className="text-[var(--primary-color)] text-sm font-medium hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          View All
        </motion.button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {sampleBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                duration: 0.4,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200
              }}
              className="relative"
            >
              {/* Timeline line */}
              {index < sampleBookings.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-white/10" />
              )}
              
              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors group">
                {/* Timeline dot */}
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(booking.status)} relative z-10`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="material-symbols-outlined text-sm">
                    {getStatusIcon(booking.status)}
                  </span>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-medium capitalize">
                      {booking.service_type} Service
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      <span>{formatDate(booking.date)} at {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">attach_money</span>
                      <span>₹{booking.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="material-symbols-outlined text-white/50 text-sm">more_vert</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sampleBookings.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              className="material-symbols-outlined text-white/30 text-4xl mb-3 block"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              timeline
            </motion.span>
            <p className="text-white/60">No bookings scheduled</p>
            <p className="text-white/40 text-sm">Your upcoming bookings will appear here</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default BookingTimeline










