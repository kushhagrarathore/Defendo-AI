import { motion, AnimatePresence } from "framer-motion"

const Modal = ({ isOpen, onClose, title, children, widthClass = "max-w-2xl", theme = "dark" }) => {
  const isDark = theme === 'dark'
  const frameClass = isDark
    ? `w-full ${widthClass} rounded-2xl shadow-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-[#1a1a1a]/90 to-[#0f0f0f]/90 backdrop-blur-xl`
    : `w-full ${widthClass} bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`
  const headerClass = isDark
    ? "px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between"
    : "px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between"
  const titleClass = isDark ? "text-lg font-semibold text-white" : "text-lg font-semibold text-gray-800"
  const closeBtnClass = isDark ? "p-2 rounded-lg hover:bg-white/10" : "p-2 rounded-lg hover:bg-gray-100"
  const closeIconClass = isDark ? "material-symbols-outlined text-white/80" : "material-symbols-outlined text-gray-600"
  const bodyClass = isDark ? "p-6 text-white" : "p-6 bg-white"
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              className={frameClass}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <div className={headerClass}>
                <h3 className={titleClass}>{title}</h3>
                <button onClick={onClose} className={closeBtnClass}>
                  <span className={closeIconClass}>close</span>
                </button>
              </div>
              <div className={bodyClass}>{children}</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal


