import { test, expect } from '@playwright/test'

test('fleet manager vehicle workflow', async ({ page }) => {
  // Login placeholder
  await page.goto('/');
  // Navigate to vehicles page
  await page.goto('/test-org/vehicles');
  // Add vehicle form open
  await page.click('text=Add Vehicle');
  // Fill minimal fields
  await page.fill('[name="vin"]', '1XP5DB9X7YN525486');
  await page.fill('[name="make"]', 'Make');
  await page.fill('[name="model"]', 'Model');
  await page.fill('[name="year"]', '2024');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Vehicle created')).toBeVisible();
})
