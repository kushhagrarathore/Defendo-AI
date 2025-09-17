import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const AnimatedCounter = ({ 
  end, 
  duration = 2, 
  suffix = '', 
  prefix = '',
  className = '',
  delay = 0 
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.5 })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        let startTime = null
        const animate = (currentTime) => {
          if (startTime === null) startTime = currentTime
          const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
          setCount(Math.floor(progress * end))
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      }, delay * 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isInView, end, duration, delay])

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  )
}

export default AnimatedCounter



