import { test, expect } from '@playwright/test'
test.describe('首页', () => {
  test('应正确加载首页', async ({ page }) => {
    await page.goto('/')
    // 未登录应跳转到登录页
    await expect(page).toHaveURL(/login/)
  })
})
