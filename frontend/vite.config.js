import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true, // Enforce 5173 ONLY - no fallback to 5177
    hmr: {
      host: 'localhost',
      port: 5173
    },
    // Proxy backend routes to Django during local development so OAuth flows
    // and cookie-backed auth work the same way they do behind Nginx in prod.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/glogin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/accounts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api-auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
