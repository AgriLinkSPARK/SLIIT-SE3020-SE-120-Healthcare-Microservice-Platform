import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/doctor': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/appointments': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
      '/api/patients': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/doctors': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/telemedicine': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
})
