import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Important: Set the base to your repository name for GitHub Pages
  base: '/bizgro-kpi2.0/',
})
