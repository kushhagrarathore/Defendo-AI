const GlassCard = ({ className = "", children }) => {
  return (
    <div className={`rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)] ${className}`}>
      {children}
    </div>
  )
}

export default GlassCard


