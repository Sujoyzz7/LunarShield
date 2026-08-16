import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/* eslint-disable react-hooks/rules-of-hooks */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Playwright fixture that loads the built extension.
 * - Uses a persistent context (extensions only work there).
 * - `channel: 'chromium'` is required for headless extension loading.
 * - The extension ID is dynamic, so we read it from the service worker URL.
 */
/* eslint-disable no-empty-pattern */
export const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '..', 'dist')
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: true,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    })
    await use(context)
    await context.close()
  },

  extensionId: async ({ context }, useExtensionId) => {
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent('serviceworker')
    }
    const extensionId = new URL(worker.url()).host
    await useExtensionId(extensionId)
  },
})

export const expect = test.expect
