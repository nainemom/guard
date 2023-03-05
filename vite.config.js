import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc'
import { version } from './package.json';
import { resolve } from 'path';

export default (configEnv) => {
  process.env = loadEnv(configEnv.mode, resolve(__dirname, './'), '');
  return defineConfig({
    base: process.env.BASE_URL,
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    define: {
      ENV: {
        APP_VERSION: version,
        BASE_URL: process.env.BASE_URL,
      },
    },
  });
};
