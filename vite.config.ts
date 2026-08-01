import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    // Chrome 111 = first version supporting `world: 'MAIN'` content scripts.
    target: 'chrome111',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    css: false,
  },
})
