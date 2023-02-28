import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'
import { version } from './package.json';
import { resolve, parse } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    APP_VERSION: JSON.stringify(version),
  },
})
