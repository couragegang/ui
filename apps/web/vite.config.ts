import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-markdown', 'remark-gfm'],
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@couragegang/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@couragegang/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@couragegang/design-system': path.resolve(__dirname, '../../packages/design-system/src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (p) => `/v1/bff${p}`,
      },
      '/health': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: () => '/v1/bff/health',
      },
    },
  },
})
