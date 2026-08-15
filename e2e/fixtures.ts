import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'node:path'

/**
 * Playwright fixture that loads the built extension.
 * - Uses a persistent context (extensions only work there).
 * - `channel: 'chromium'` is required for headless extension loading.
 * - The extension ID is dynamic, so we read it from the service worker URL.
 */
export const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  context: async (_, use) => {
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

  extensionId: async ({ context }, use) => {
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent('serviceworker')
    }
    const extensionId = new URL(worker.url()).host
    await use(extensionId)
  },
})

export const expect = test.expect
