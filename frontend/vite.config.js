import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true, // Enforce 5173 ONLY - no fallback to 5177
    hmr: {
      host: 'localhost',
      port: 5173
    },
    // Proxy API requests to backend - prevents ad blocker blocking
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
