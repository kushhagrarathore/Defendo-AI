import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const bgColor = {
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
  }

  const icon = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 ${bgColor[type]} border rounded-xl p-4 shadow-2xl backdrop-blur-sm min-w-[300px] max-w-md`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">{icon[type]}</span>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
