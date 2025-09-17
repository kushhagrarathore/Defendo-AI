import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GuardTracker = () => {
  const [guards, setGuards] = useState([
    { id: 1, name: 'Akhil Kumar', status: 'online', location: 'Indore Central', lastSeen: '2 min ago' },
    { id: 2, name: 'Priya Singh', status: 'offline', location: 'Bhopal Mall', lastSeen: '1 hour ago' },
    { id: 3, name: 'Ravi Patel', status: 'online', location: 'Gwalior Station', lastSeen: '5 min ago' },
    { id: 4, name: 'Sneha Sharma', status: 'busy', location: 'Ujjain Temple', lastSeen: '10 min ago' }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/20'
      case 'offline': return 'text-red-400 bg-red-500/20'
      case 'busy': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return 'circle'
      case 'offline': return 'radio_button_unchecked'
      case 'busy': return 'schedule'
      default: return 'help'
    }
  }

  const onlineCount = guards.filter(guard => guard.status === 'online').length
  const totalGuards = guards.length

  return (
    <motion.div
      className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Guard Status</h2>
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="w-3 h-3 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-green-400 text-sm font-medium">
            {onlineCount}/{totalGuards} Online
          </span>
        </motion.div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {guards.map((guard, index) => (
            <motion.div
              key={guard.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                duration: 0.4,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200
              }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              {/* Status indicator */}
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(guard.status)}`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span className="material-symbols-outlined text-sm">
                  {getStatusIcon(guard.status)}
                </span>
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium text-sm truncate">
                    {guard.name}
                  </h3>
                  <motion.div
                    className={`w-2 h-2 rounded-full ${
                      guard.status === 'online' ? 'bg-green-400' : 
                      guard.status === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}
                    animate={guard.status === 'online' ? { 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1]
                    } : {}}
                    transition={{ 
                      duration: 2, 
                      repeat: guard.status === 'online' ? Infinity : 0,
                      ease: 'easeInOut'
                    }}
                  />
                </div>
                <p className="text-white/70 text-xs truncate">
                  {guard.location}
                </p>
                <p className="text-white/50 text-xs">
                  Last seen: {guard.lastSeen}
                </p>
              </div>

              <motion.button
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="material-symbols-outlined text-white/50 text-sm">more_vert</span>
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Map placeholder */}
      <motion.div
        className="mt-6 p-4 rounded-lg border border-white/10 bg-white/5 text-center"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          className="material-symbols-outlined text-white/30 text-3xl mb-2 block"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          map
        </motion.span>
        <p className="text-white/60 text-sm">Live Map View</p>
        <p className="text-white/40 text-xs">Coming Soon</p>
      </motion.div>
    </motion.div>
  )
}

export default GuardTracker



