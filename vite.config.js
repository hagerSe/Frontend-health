import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
      '/api': { 
        target: 'http://localhost:5000',  // All requests to /api go to your backend server
        changeOrigin: true,               // Changes the origin header to match the target
        secure: false                     // Allows proxying to HTTP (not HTTPS) servers
      },
=======
      '/api': { target: 'http://localhost:5000', changeOrigin: true , secure: false},
>>>>>>> b43e6a4d7413253110d828972d10017b2a5508e8
    },
  },
})