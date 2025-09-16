import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Important: Set the base to your repository name for GitHub Pages
  base: '/bizgro-kpi2.0/',
  server: {
    // Proxy only works in local development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      // Proxy Google Docs through the dev server
      '/gs': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/gs/, ''),
      }
    }
  }
})
