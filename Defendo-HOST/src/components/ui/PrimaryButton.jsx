const PrimaryButton = ({ children, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`bg-gradient-to-r from-[var(--primary-color)] via-emerald-400 to-[#2a5a3a] text-[#111714] px-6 py-3 rounded-full font-bold shadow-[0_10px_30px_rgba(74,222,128,0.25)] hover:shadow-[0_18px_40px_rgba(74,222,128,0.35)] transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  )
}

export default PrimaryButton


