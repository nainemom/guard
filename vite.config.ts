import { resolve } from 'node:path';
import { serwist } from '@serwist/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/guard/',
  plugins: [
    react(),
    tailwindcss(),
    serwist({
      swSrc: 'src/sw.ts',
      swDest: 'sw.js',
      globDirectory: 'dist',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
      injectionPoint: 'self.__SW_MANIFEST',
      rollupFormat: 'iife',
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
});
