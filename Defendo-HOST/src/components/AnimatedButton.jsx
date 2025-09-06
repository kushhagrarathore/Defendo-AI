import { useState } from 'react'

const AnimatedButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  icon = null,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const baseClasses = `
    relative overflow-hidden font-medium rounded-lg transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `.trim()

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] text-[#111714] hover:shadow-lg hover:shadow-[var(--primary-color)]/25',
    secondary: 'bg-[#29382f] text-white hover:bg-[#3a4a3f] hover:shadow-lg',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25',
    ghost: 'bg-transparent text-white hover:bg-white/10 border border-white/20 hover:border-white/40'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e)
    }
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ripple`}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.1s ease-out'
      }}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span className="material-symbols-outlined">{icon}</span>}
            {children}
          </>
        )}
      </div>
    </button>
  )
}

export default AnimatedButton
