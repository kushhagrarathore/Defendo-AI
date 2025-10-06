// Image optimization utilities
export const imageOptimization = {
  // Lazy load images with intersection observer
  lazyLoadImages: () => {
    if (typeof window === 'undefined') return

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src
          if (src) {
            img.src = src
            img.classList.remove('lazy')
            img.classList.add('loaded')
            observer.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })

    return imageObserver
  },

  // Generate responsive image URLs for Supabase Storage
  generateResponsiveImageUrl: (url, width = 400, quality = 80) => {
    if (!url || !url.includes('supabase')) return url
    
    // For Supabase Storage, we can add query parameters for optimization
    const urlObj = new URL(url)
    urlObj.searchParams.set('width', width.toString())
    urlObj.searchParams.set('quality', quality.toString())
    urlObj.searchParams.set('format', 'webp')
    
    return urlObj.toString()
  },

  // Preload critical images
  preloadImages: (imageUrls) => {
    if (typeof window === 'undefined') return

    imageUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  },

  // Create image placeholder
  createPlaceholder: (width = 400, height = 300, text = 'Loading...') => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#1a241e')
    gradient.addColorStop(1, '#29382f')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Add text
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)
    
    return canvas.toDataURL()
  },

  // Optimize image loading with progressive enhancement
  progressiveImageLoad: (imgElement, lowQualityUrl, highQualityUrl) => {
    if (!imgElement) return

    // Load low quality first
    imgElement.src = lowQualityUrl
    imgElement.classList.add('blur-sm', 'transition-all', 'duration-300')

    // Then load high quality
    const highQualityImg = new Image()
    highQualityImg.onload = () => {
      imgElement.src = highQualityUrl
      imgElement.classList.remove('blur-sm')
      imgElement.classList.add('loaded')
    }
    highQualityImg.src = highQualityUrl
  }
}

// Initialize image optimization on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    imageOptimization.lazyLoadImages()
  })
}
