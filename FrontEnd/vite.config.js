import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  
    proxy: {
      // String shorthand for simple targets
      '/api': {
        target: 'http://localhost:5000', // Your backend server
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // If you're using http
        
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true, // Enable WebSocket proxying
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
