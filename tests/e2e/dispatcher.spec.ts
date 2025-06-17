import { test, expect } from '@playwright/test'

test.describe('Dispatcher workflow', () => {
  test('post load and assign driver', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Placeholder: replace with actual login flow
    await page.goto('http://localhost:3000/org/test-org/dispatch/test-user/new')
    await page.fill('input[name="referenceNumber"]', 'TEST123')
    await page.fill('input[name="pickupDate"]', '2030-01-01')
    await page.fill('input[name="deliveryDate"]', '2030-01-02')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dispatch\/test-user$/)
  })

  test('live tracking stream loads', async ({ page }) => {
    await page.goto('http://localhost:3000/org/test-org/dispatch/test-user')
    await page.waitForSelector('text=Dispatch Board')
    // Simulate SSE updates via route interception
    await page.route('**/api/dispatch/**/stream', route => {
      route.fulfill({
        status: 200,
        body: 'data: {"type":"connected"}\n\n'
      })
    })
    await page.reload()
    await expect(page.locator('text=Dispatch Board')).toBeVisible()
  })
})
