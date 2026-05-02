import { test, expect } from '@playwright/test'

test.describe('首页', () => {
  test('应正确加载首页', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/My Account/)
  })
})
