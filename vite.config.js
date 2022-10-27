import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { version } from './package.json';
import { resolve as pathResolve } from 'path';

export default defineConfig({
  plugins: [preact()],
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
        if (id.includes('node_modules/preact')) {
          return 'preact';
        }
        if (id.includes('node_modules/@dicebear')) {
          return 'dicebear';
        }
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      },
    },
  },
})
