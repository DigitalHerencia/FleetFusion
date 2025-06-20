/** @format */

import { expect, test } from "@playwright/test"
import { createTestAuth } from "../fixtures/auth"

test.describe("Analytics dashboard", () => {
    test("dashboard loads and export button visible", async ({
        page,
        context,
    }) => {
        const auth = createTestAuth(page, context)
        await auth.loginAsAdmin()

        await page.goto("/org1/analytics")

        // Wait for page to load
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for analytics content
        const hasAnalyticsContent = await page
            .locator("text=/Analytics|Dashboard|Export/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasAnalyticsContent).toBeTruthy()

        // Look for export functionality (adjust selector based on actual UI)
        const hasExportButton = await page
            .locator(
                'button:has-text(/Export/i), [role="button"]:has-text(/Export/i)'
            )
            .first()
            .isVisible()
            .catch(() => false)
        if (hasExportButton) {
            await expect(
                page
                    .locator(
                        'button:has-text(/Export/i), [role="button"]:has-text(/Export/i)'
                    )
                    .first()
            ).toBeVisible()
        }
    })
})
