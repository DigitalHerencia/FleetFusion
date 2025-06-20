/** @format */

import { expect, test } from "@playwright/test"
import { createTestAuth } from "./fixtures/auth"

test.describe("Driver E2E", () => {
    test.beforeEach(async ({ page, context }) => {
        // Set up test authentication
        const auth = createTestAuth(page, context)
        await auth.loginAsDriver()
    })

    test("driver sign up flow", async ({ page, context }) => {
        // Test driver can access sign-up (this should be public)
        const auth = createTestAuth(page, context)
        await auth.logout() // Clear auth for sign-up test

        await page.goto("/sign-up")
        await expect(
            page.locator('h1:has-text("CREATE YOUR ACCOUNT")')
        ).toBeVisible()

        // Check if form fields exist
        await expect(page.locator('input[name="fullName"]')).toBeVisible()
        await expect(page.locator('input[name="email"]')).toBeVisible()
        await expect(page.locator('input[name="password"]')).toBeVisible()
        await expect(
            page.locator('button:has-text("Create account")')
        ).toBeVisible()
    })

    test("driver can access HOS entry page", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.navigateToTenant("/drivers/user_driver123/hos", {
            role: "driver",
        })

        // Wait for page to load and check for HOS-related content
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for HOS-related elements (adjust selectors based on actual UI)
        const hasHOSContent = await page
            .locator("text=/HOS|Hours|Service|Driver/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasHOSContent).toBeTruthy()
    })

    test("driver can view performance metrics", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.navigateToTenant("/analytics/performance", {
            role: "driver",
        })

        // Check if analytics page loads (adjust selectors based on actual UI)
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for performance-related content
        const hasPerformanceContent = await page
            .locator("text=/Performance|Analytics|Metrics/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasPerformanceContent).toBeTruthy()
    })

    test("driver can access compliance page", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.navigateToTenant("/compliance", { role: "driver" })

        // Check if compliance page loads
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for compliance-related content
        const hasComplianceContent = await page
            .locator("text=/Compliance|Violation|Regulation/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasComplianceContent).toBeTruthy()
    })
})
