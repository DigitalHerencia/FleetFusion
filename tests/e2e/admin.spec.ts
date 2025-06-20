/** @format */

import { expect, test } from "@playwright/test"
import { createTestAuth } from "../fixtures/auth"

test.describe("Admin users management", () => {
    test("users page loads", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.loginAsAdmin()

        await page.goto("/org1/admin/users")

        // Wait for page to load and check for admin content
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for users-related content (adjust based on actual UI)
        const hasUsersContent = await page
            .locator("text=/Users|User Management|Admin/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasUsersContent).toBeTruthy()
    })
})
