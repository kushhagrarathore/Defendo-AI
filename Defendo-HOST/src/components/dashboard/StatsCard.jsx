import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'

const StatsCard = ({ 
  label, 
  value, 
  icon, 
  growth, 
  growthType = 'increase', 
  index = 0,
  isCurrency = false 
}) => {
  const formatValue = (val) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(val)
    }
    return val
  }

  return (
    <motion.div
      className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)] group hover:border-[var(--primary-color)]/30 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 220, 
        damping: 24,
        delay: index * 0.1 
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        boxShadow: '0 10px 30px rgba(74,222,128,0.08)',
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-full bg-[var(--primary-color)]/15 flex items-center justify-center"
            whileHover={{ 
              scale: 1.1,
              rotate: 360,
              transition: { duration: 0.6 }
            }}
            animate={{ 
              scale: [1, 1.05, 1],
              transition: { 
                duration: 2, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: index * 0.2
              }
            }}
          >
            <span className="material-symbols-outlined text-[var(--primary-color)] text-xl">
              {icon}
            </span>
          </motion.div>
          <div>
            <p className="text-white/70 text-sm font-medium">{label}</p>
            <div className="flex items-center gap-2">
              <AnimatedCounter 
                end={value} 
                suffix={isCurrency ? '' : ''}
                className="text-2xl font-bold text-white"
                delay={index * 0.1}
              />
              {isCurrency && <span className="text-2xl font-bold text-white">₹</span>}
            </div>
          </div>
        </div>
        
        {growth !== undefined && (
          <motion.div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              growthType === 'increase' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <span className="material-symbols-outlined text-sm">
              {growthType === 'increase' ? 'trending_up' : 'trending_down'}
            </span>
            <span>{growth}%</span>
          </motion.div>
        )}
      </div>
      
      {/* Animated progress bar */}
      <motion.div
        className="w-full h-1 bg-white/10 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 + index * 0.1 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--primary-color)] to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
          transition={{ 
            duration: 1.5, 
            delay: 0.5 + index * 0.1,
            ease: 'easeOut'
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export default StatsCard






























