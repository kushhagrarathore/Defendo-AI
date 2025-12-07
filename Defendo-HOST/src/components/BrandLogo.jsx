const BrandLogo = ({
  showText = true,
  text = 'Defendo',
  className = '',
  imgClassName = 'h-8 w-auto',
  textClassName = 'font-semibold tracking-tight text-slate-900',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/LOGO/DEFENDOLOGO.png"
        alt="Defendo logo"
        className={`object-contain ${imgClassName}`}
        draggable="false"
        loading="lazy"
      />
      {showText && (
        <span className={textClassName}>{text}</span>
      )}
    </div>
  )
}

export default BrandLogo

