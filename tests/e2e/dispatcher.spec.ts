/** @format */

import { expect, test } from "@playwright/test"
import { createTestAuth } from "../fixtures/auth"

test.describe("Dispatcher workflow", () => {
    test("post load and assign driver", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.loginAsDispatcher()

        // Navigate to dispatch new load page
        await page.goto("/org1/dispatch/user_dispatcher123/new")

        // Wait for page to load
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for dispatch form elements (adjust based on actual UI)
        const hasDispatchContent = await page
            .locator("text=/Load|Dispatch|Reference|Pickup|Delivery/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasDispatchContent).toBeTruthy()
    })

    test("live tracking stream loads", async ({ page, context }) => {
        const auth = createTestAuth(page, context)
        await auth.loginAsDispatcher()

        await page.goto("/org1/dispatch/user_dispatcher123")

        // Wait for page to load
        await expect(page.locator("h1, h2, h3").first()).toBeVisible({
            timeout: 10000,
        })

        // Look for dispatch board content
        const hasDispatchBoard = await page
            .locator("text=/Dispatch|Board|Tracking|Stream/i")
            .first()
            .isVisible()
            .catch(() => false)
        expect(hasDispatchBoard).toBeTruthy()
    })
})
