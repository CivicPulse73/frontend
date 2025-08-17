import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: true, // Allow access from network
      cors: true,
      proxy: {
        // Proxy API requests to backend during development
        '/api': {
          target: env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      // Generate source maps for development builds
      sourcemap: true,
      // Increase chunk size warning limit for development
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['framer-motion', 'lucide-react', 'clsx']
          }
        }
      }
    },
    define: {
      // Define environment variables for development
      __DEV__: JSON.stringify(true),
    }
  }
})
