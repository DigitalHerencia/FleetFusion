import { test, expect } from '@playwright/test'

test.describe('IFTA workflow', () => {
  test('trip entry button visible', async ({ page }) => {
    await page.goto('/test-org/ifta')
    await expect(page.getByRole('button', { name: /add trip/i })).toBeVisible()
  })

  test('fuel upload button visible', async ({ page }) => {
    await page.goto('/test-org/ifta')
    await expect(page.getByRole('button', { name: /add fuel purchase/i })).toBeVisible()
  })

  test('report submission button visible', async ({ page }) => {
    await page.goto('/test-org/ifta')
    await expect(page.getByRole('button', { name: /generate report/i })).toBeVisible()
  })
})
