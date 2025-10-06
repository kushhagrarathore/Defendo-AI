// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName, startTime) => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    if (import.meta.env.DEV) {
      console.log(`⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`)
    }
    
    // Log slow renders in production
    if (renderTime > 100 && import.meta.env.PROD) {
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
    }
    
    return renderTime
  },

  // Measure API call performance
  measureApiCall: async (apiName, apiCall) => {
    const startTime = performance.now()
    try {
      const result = await apiCall()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (import.meta.env.DEV) {
        console.log(`🌐 ${apiName} completed in ${duration.toFixed(2)}ms`)
      }
      
      if (duration > 2000 && import.meta.env.PROD) {
        console.warn(`🐌 Slow API call: ${apiName} took ${duration.toFixed(2)}ms`)
      }
      
      return { result, duration }
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      console.error(`❌ ${apiName} failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  },

  // Measure bundle size
  measureBundleSize: () => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      
      console.log('📦 Bundle Analysis:')
      console.log(`Scripts: ${scripts.length} files`)
      console.log(`Styles: ${styles.length} files`)
      
      // Log large scripts
      scripts.forEach(script => {
        const src = script.src
        if (src.includes('assets/') && src.includes('.js')) {
          console.log(`📄 Script: ${src.split('/').pop()}`)
        }
      })
    }
  },

  // Monitor memory usage
  monitorMemory: () => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = performance.memory
      const used = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
      const total = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2)
      
      if (import.meta.env.DEV) {
        console.log(`🧠 Memory: ${used}MB / ${total}MB`)
      }
      
      // Warn about high memory usage
      if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
        console.warn('⚠️ High memory usage detected!')
      }
    }
  },

  // Measure Core Web Vitals
  measureWebVitals: () => {
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('🎯 LCP:', lastEntry.startTime.toFixed(2) + 'ms')
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          console.log('🎯 FID:', entry.processingStart - entry.startTime + 'ms')
        })
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        console.log('🎯 CLS:', clsValue.toFixed(4))
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Run on page load
  window.addEventListener('load', () => {
    performanceMonitor.measureBundleSize()
    performanceMonitor.monitorMemory()
    performanceMonitor.measureWebVitals()
  })

  // Monitor memory every 30 seconds
  setInterval(() => {
    performanceMonitor.monitorMemory()
  }, 30000)
}
