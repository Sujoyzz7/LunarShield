import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node e2e/fixture-server.mjs',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
})
