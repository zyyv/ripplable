import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
