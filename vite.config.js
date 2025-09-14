import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Set base for GitHub Pages only in production build
    base: command === 'build' ? '/bizgro-kpi2.0/' : '/',
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy, options) => {
            // Log proxy requests for debugging
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying:', req.method, req.url, '->', options.target + req.url)
            })
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      // Ensure assets work correctly with the base path
      assetsDir: 'assets',
      sourcemap: command === 'serve' ? 'inline' : false
    }
  }
})
