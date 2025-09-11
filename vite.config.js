/ File: vite.config.js
const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/bizgro-kpi2.0/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})`;
