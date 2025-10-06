import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      overlay: true
    },
    watch: {
      usePolling: true,
      interval: 200
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            if (id.includes('framer-motion') || id.includes('recharts')) {
              return 'ui-vendor'
            }
            return 'vendor'
          }
          
          // App chunks
          if (id.includes('/src/pages/')) {
            if (id.includes('Dashboard') || id.includes('MyServices') || id.includes('AddService') || id.includes('EditService')) {
              return 'dashboard'
            }
            if (id.includes('Login') || id.includes('Signup') || id.includes('AdminLogin')) {
              return 'auth'
            }
            return 'pages'
          }
          
          if (id.includes('/src/components/')) {
            return 'components'
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop().replace('.jsx', '')
            return `assets/${fileName}-[hash].js`
          }
          return 'assets/[name]-[hash].js'
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    reportCompressedSize: true
  },
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'recharts'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
})