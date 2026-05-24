import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const webRoot = path.dirname(fileURLToPath(import.meta.url))
const webNodeModules = path.join(webRoot, 'node_modules')

export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: 'web-assets',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-markdown',
      'remark-gfm',
      'react-native-web',
    ],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
    alias: {
      react: path.join(webNodeModules, 'react'),
      'react-dom': path.join(webNodeModules, 'react-dom'),
      'react-native': path.join(webNodeModules, 'react-native-web'),
      '@couragegang/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@couragegang/shared/chat-storage': path.resolve(
        __dirname,
        '../../packages/shared/src/chat-storage.ts',
      ),
      '@couragegang/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@couragegang/design-system': path.resolve(__dirname, '../../packages/design-system/src'),
      '@couragegang/app-ui': path.resolve(__dirname, '../../packages/app-ui/src'),
      '@couragegang/app-ui/screens': path.resolve(
        __dirname,
        '../../packages/app-ui/src/screens/index.web.ts',
      ),
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
