import { test, expect } from './fixtures'

test.describe('LunarShield Extension E2E', () => {
  test('loads fixture page with extension active', async ({ context }) => {
    const page = await context.newPage()
    await page.goto('http://localhost:4173/')
    await expect(page).toHaveTitle('LunarShield fixture')
    await expect(page.locator('h1')).toHaveText('LunarShield e2e fixture')
  })

  test('popup page opens successfully', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`)
    await expect(page).toHaveTitle('LunarShield')
    await expect(page.locator('body')).toBeVisible()
  })

  test('options page opens successfully', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/src/options/index.html`)
    await expect(page).toHaveTitle('LunarShield — Settings')
    await expect(page.locator('body')).toBeVisible()
  })
})
