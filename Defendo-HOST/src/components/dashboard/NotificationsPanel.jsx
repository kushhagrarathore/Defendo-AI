import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NotificationsPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([])

  // Listen for dashboard push events
  useEffect(() => {
    const handler = (e) => {
      const notif = e.detail
      setNotifications(prev => [
        { id: notif.id || Date.now(), ...notif },
        ...prev
      ])
    }
    window.addEventListener('dashboard:new-notification', handler)
    return () => window.removeEventListener('dashboard:new-notification', handler)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return 'event_available'
      case 'cancellation': return 'event_busy'
      case 'payment': return 'payments'
      case 'alert': return 'warning'
      default: return 'notifications'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking': return 'text-green-400 bg-green-500/20'
      case 'cancellation': return 'text-red-400 bg-red-500/20'
      case 'payment': return 'text-blue-400 bg-blue-500/20'
      case 'alert': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    )
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-[#111714] border-l border-white/10 shadow-2xl z-50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="material-symbols-outlined text-white/70">close</span>
                </motion.button>
              </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto h-full">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 200
                    }}
                    className={`p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 ${
                      notification.unread ? 'ring-2 ring-[var(--primary-color)]/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {notification.unread && (
                            <motion.div
                              className="w-2 h-2 bg-[var(--primary-color)] rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <p className="text-white/70 text-xs mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-white/50 text-xs">
                          {notification.time}
                        </p>
                      </div>
                      
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }}
                        className="p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="material-symbols-outlined text-white/50 text-sm">close</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {notifications.length === 0 && (
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
                    notifications_none
                  </motion.span>
                  <p className="text-white/60">No notifications</p>
                  <p className="text-white/40 text-sm">You're all caught up!</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotificationsPanel



