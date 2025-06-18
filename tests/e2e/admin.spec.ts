import { test, expect } from '@playwright/test'

test.describe('Admin users management', () => {
  test('users page loads', async ({ page }) => {
    await page.goto('/')
    await page.goto('/org1/admin/users')
    await expect(page.getByRole('heading', { name: /Users/i })).toBeVisible()
  })
})
