
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    watch: {
      usePolling: true
    },
    hmr: {
      clientPort: 8443,
      protocol: 'wss' 
    }
  }
})