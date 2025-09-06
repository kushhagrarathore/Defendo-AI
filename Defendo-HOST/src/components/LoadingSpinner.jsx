const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-[var(--primary-color)]',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`w-full h-full border-4 border-transparent border-t-current rounded-full animate-spin ${colorClasses[color]}`}></div>
    </div>
  )
}

export default LoadingSpinner
