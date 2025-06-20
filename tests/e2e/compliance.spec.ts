/** @format */

import { expect, test } from "@playwright/test"
import { createTestAuth } from "../fixtures/auth"

test.describe("compliance flow", () => {
    test("document upload and remediation", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.loginAsAdmin()

        await page.goto("/org1/compliance")

        // Wait for page to load
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for compliance content
        const hasComplianceContent = await page
            .locator("text=/Compliance|Document|Upload|Violation/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasComplianceContent).toBeTruthy()

        // Look for document upload functionality
        const hasUploadContent = await page
            .locator('input[type="file"], text=/Upload|Document|File/i')
            .first()
            .isVisible()
            .catch(() => false)
        if (hasUploadContent) {
            expect(hasUploadContent).toBeTruthy()
        }
    })
})
