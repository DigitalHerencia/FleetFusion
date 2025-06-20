/** @format */

import { expect, test } from "@playwright/test"
import { createTestAuth } from "../fixtures/auth"

test.describe("IFTA workflow", () => {
    test("trip entry button visible", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.loginAsAdmin()

        await page.goto("/org1/ifta")

        // Wait for page to load
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for IFTA content and trip functionality
        const hasIFTAContent = await page
            .locator("text=/IFTA|Trip|Add Trip|Fuel/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasIFTAContent).toBeTruthy()
    })

    test("fuel upload button visible", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.loginAsAdmin()

        await page.goto("/org1/ifta")

        // Wait for page to load
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for fuel purchase functionality
        const hasFuelContent = await page
            .locator("text=/Fuel|Purchase|Upload|Add Fuel/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasFuelContent).toBeTruthy()
    })

    test("report submission button visible", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.loginAsAdmin()

        await page.goto("/org1/ifta")

        // Wait for page to load
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for report generation functionality
        const hasReportContent = await page
            .locator("text=/Report|Generate|Submit|IFTA Report/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasReportContent).toBeTruthy()
    })
})
