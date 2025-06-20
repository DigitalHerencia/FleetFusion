import { test, expect } from '@playwright/test';

test('UI health check', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with your application's URL
    const title = await page.title();
    expect(title).toBe('Expected Title'); // Replace with the expected title of your application
    const element = await page.locator('selector-for-element'); // Replace with a valid selector
    await expect(element).toBeVisible();
});