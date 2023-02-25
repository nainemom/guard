import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'
import { version } from './package.json';
import { resolve as pathResolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': pathResolve(__dirname, './src'),
    },
  },
  define: {
    APP_VERSION: JSON.stringify(version),
  },
  build: {
    rollupOptions: {
      manualChunks(id) {
        if (id.includes('node_modules/react')) {
          return 'react';
        }
        if (id.includes('node_modules/@dicebear')) {
          return 'dicebear';
        }
      },
    },
  },
})
