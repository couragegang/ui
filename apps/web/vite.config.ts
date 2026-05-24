import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@couragegang/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@couragegang/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@couragegang/design-system': path.resolve(__dirname, '../../packages/design-system/src'),
    },
  },
  server: {
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
