/** @format */

import { expect, test } from "@playwright/test"

const BASE_URL = "http://localhost:3000"

test.describe("Authentication Flow", () => {
    test("Sign up page loads and CAPTCHA widget is present", async ({
        page,
    }) => {
        await page.goto(`${BASE_URL}/sign-up`)
        await expect(page.locator("#clerk-captcha")).toBeVisible()
    })

    test("Sign in page loads", async ({ page }) => {
        await page.goto(`${BASE_URL}/sign-in`)
        await expect(page.locator("h1")).toContainText(
            "SIGN IN TO YOUR ACCOUNT"
        )
    })

    test("Dashboard page shows unauthorized for unauthenticated user", async ({
        page,
    }) => {
        await page.goto(`${BASE_URL}/testorg/dashboard/testuser`)
        await expect(page.locator("body")).toContainText(
            /sign in|unauthorized/i
        )
    })
})
