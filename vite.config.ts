import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { booksApiPlugin } from './vite/plugins/booksApi.ts'

export default defineConfig({
  base: '/tier-list/',
  plugins: [booksApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@data': fileURLToPath(new URL('./data', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
    },
  },
})
