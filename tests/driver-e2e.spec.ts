import { test, expect } from '@playwright/test'

test.describe('Driver E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/clerk/*', route => route.fulfill({ status: 200, body: '{}' }))
  })

  test('driver sign up flow', async ({ page }) => {
    await page.goto('/sign-up')
    await page.fill('input[name="email"]', 'driver@example.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/onboarding/)
  })

  test('log HOS entry', async ({ page }) => {
    await page.goto('/drivers/hos')
    await page.fill('input[name="location"]', 'Dallas')
    await page.fill('input[name="startTime"]', '2024-01-01T08:00')
    await page.fill('input[name="endTime"]', '2024-01-01T09:00')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Entry saved')).toBeVisible()
  })

  test('view performance metrics', async ({ page }) => {
    await page.goto('/analytics/performance')
    await expect(page.locator('text=Driver Performance')).toBeVisible()
  })

  test('handle compliance alert', async ({ page }) => {
    await page.goto('/compliance')
    await expect(page.locator('text=HOS Violations')).toBeVisible()
  })
})
