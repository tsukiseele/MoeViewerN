import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables";`,
      },
    },
  },
  optimizeDeps: {
    // exclude: ['path', 'fs', 'os', 'perf_hooks', 'util',, 'buffer', 'node-fetch', 'https-proxy-agent', 'get-proxy-settings'],
  },
})
