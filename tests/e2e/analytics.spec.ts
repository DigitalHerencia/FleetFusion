import { test, expect } from '@playwright/test';

test.describe('Analytics dashboard', () => {
  test('dashboard loads and export button visible', async ({ page }) => {
    await page.goto('/');
    await page.goto('/org1/analytics');
    await expect(page.getByRole('heading', { name: /Analytics/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export/i })).toBeVisible();
  });
});
