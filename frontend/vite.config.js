import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  // Production site is served from the domain root.
  base: '/',
=======
  // Serve and build the app under /home/
  base:"/",
>>>>>>> 0047a86 (config.js)
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
