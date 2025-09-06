import { useState } from 'react'

const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true, 
  ripple = true,
  gradient = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const baseClasses = `
    relative overflow-hidden transition-all duration-300 ease-out
    ${hover ? 'card-animate' : ''}
    ${ripple ? 'ripple' : ''}
    ${gradient ? 'bg-gradient-to-br from-[#1a241e] to-[#29382f]' : 'bg-[#1a241e]'}
    border border-[#29382f] rounded-2xl
    ${className}
  `.trim()

  return (
    <div
      className={baseClasses}
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/5 to-blue-500/5 pointer-events-none animate-pulse"></div>
      )}
    </div>
  )
}

export default AnimatedCard
