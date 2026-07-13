import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'ripplable': path.resolve(__dirname, '../packages/ui/src'),
    },
    dedupe: ['vue'],
  },
})
