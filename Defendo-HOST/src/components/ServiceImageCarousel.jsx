import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ServiceImageCarousel = ({ images, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState('next')

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-48 bg-gradient-to-br from-[#29382f] to-[#1a241e] rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 mx-auto flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
            <span className="material-symbols-outlined text-white/50 text-3xl">imagesmode</span>
          </div>
          <p className="text-white/50 text-sm mt-2">Images coming soon</p>
        </div>
      </div>
    )
  }

  // Auto-play functionality
  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setDirection('next')
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        )
        setIsTransitioning(false)
      }, 150)
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [images.length])

  const goToPrevious = () => {
    if (isTransitioning) return
    
    setDirection('prev')
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      )
      setIsTransitioning(false)
    }, 150)
  }

  const goToNext = () => {
    if (isTransitioning) return
    
    setDirection('next')
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
      setIsTransitioning(false)
    }, 150)
  }

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return
    
    setDirection(index > currentIndex ? 'next' : 'prev')
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 150)
  }

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)

  const openLightbox = () => setLightboxOpen(true)
  const closeLightbox = () => setLightboxOpen(false)

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'ArrowLeft') goToPrevious()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  const onTouchStart = (e) => setTouchStartX(e.changedTouches[0].clientX)
  const onTouchEnd = (e) => {
    if (touchStartX == null) return
    const delta = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(delta) > 40) {
      if (delta < 0) goToNext()
      else goToPrevious()
    }
    setTouchStartX(null)
  }

  return (
    <div className={`relative w-full h-48 rounded-xl overflow-hidden group ${className}`}>
      {/* Main Image Container */}
      <div className="relative w-full h-full overflow-hidden cursor-zoom-in" onClick={openLightbox}>
        {/* Image with enhanced animations */}
        <div 
          className={`w-full h-full transition-all duration-500 ease-in-out ${
            isTransitioning 
              ? direction === 'next' 
                ? 'transform -translate-x-full opacity-0 scale-95' 
                : 'transform translate-x-full opacity-0 scale-95'
              : 'transform translate-x-0 opacity-100 scale-100'
          }`}
          style={{
            backgroundImage: `url(${images[currentIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`Service image ${currentIndex + 1}`}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              isTransitioning 
                ? 'blur-sm scale-110' 
                : 'blur-0 scale-100 group-hover:scale-105'
            }`}
            onClick={openLightbox}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjkzODJmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg=='
            }}
          />
        </div>
        
        {/* Loading overlay during transitions */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              disabled={isTransitioning}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                isTransitioning 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-label="Previous image"
            >
              <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                isTransitioning ? 'animate-pulse' : ''
              }`}>chevron_left</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              disabled={isTransitioning}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                isTransitioning 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-label="Next image"
            >
              <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                isTransitioning ? 'animate-pulse' : ''
              }`}>chevron_right</span>
            </button>
          </>
        )}
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className={`absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs transition-all duration-300 ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-0 group-hover:opacity-100 scale-100'
          }`}>
            <span className="animate-fade-in-up">{currentIndex + 1} / {images.length}</span>
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 transition-all duration-300 ${
          isTransitioning ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentIndex 
                  ? 'bg-white scale-125 shadow-lg animate-pulse' 
                  : 'bg-white/50 hover:bg-white/75 hover:shadow-md'
              } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip (for multiple images) */}
      {images.length > 1 && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 transition-all duration-300 ${
          isTransitioning ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                disabled={isTransitioning}
                className={`flex-shrink-0 w-8 h-8 rounded overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                  index === currentIndex 
                    ? 'border-white scale-110 shadow-lg ring-2 ring-white/30' 
                    : 'border-white/50 hover:border-white/75 hover:shadow-md'
                } ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    index === currentIndex ? 'brightness-110' : 'brightness-75 hover:brightness-100'
                  }`}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzI5MzgyZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkU8L3RleHQ+PC9zdmc+'
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Main image area */}
            <div className="relative w-full h-full flex items-center justify-center px-10 select-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Prev */}
              {images.length > 1 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full"
                  aria-label="Previous image"
                >
                  <span className="material-symbols-outlined text-3xl">chevron_left</span>
                </button>
              )}

              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`Service image ${currentIndex + 1}`}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZHk9Ii40ZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg=='
                }}
              />

              {/* Next */}
              {images.length > 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full"
                  aria-label="Next image"
                >
                  <span className="material-symbols-outlined text-3xl">chevron_right</span>
                </button>
              )}
            </div>

            {/* Thumbnails in lightbox */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`w-14 h-14 rounded overflow-hidden border ${i === currentIndex ? 'border-white' : 'border-white/30'}`}
                  >
                    <img src={img} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ServiceImageCarousel
