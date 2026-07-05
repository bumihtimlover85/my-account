import { test, expect } from '@playwright/test'

test.describe('首页', () => {
  test('应正确加载首页', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/项目管理看板/)
  })

  test('未登录时应显示登录表单', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=登录')).toBeVisible()
    await expect(page.locator('text=注册')).toBeVisible()
  })
})
