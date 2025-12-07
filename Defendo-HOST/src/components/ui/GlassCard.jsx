const GlassCard = ({ className = "", children }) => {
  return (
    <div className={`rounded-2xl p-6 border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] ${className}`}>
      {children}
    </div>
  )
}

export default GlassCard


