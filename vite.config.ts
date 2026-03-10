import { resolve } from 'node:path';
import { serwist } from '@serwist/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/guard/' : '/',
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'entry-[hash].js',
        chunkFileNames: 'chunk-[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    serwist({
      swSrc: 'src/sw.ts',
      swDest: 'sw.js',
      globDirectory: 'dist',
      globPatterns: ['**/*.{js,css,html,json,svg}'],
      injectionPoint: 'self.__SW_MANIFEST',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium', headless: true }],
    },
  },
}));
