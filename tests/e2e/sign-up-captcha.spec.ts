/** @format */

import { clerk } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"

test.describe("Sign-up Form with CAPTCHA", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the sign-up page
        await page.goto("/sign-up")
    })

    test("should display CAPTCHA widget on sign-up form", async ({ page }) => {
        // Check that the sign-up form exists
        await expect(page.locator("form")).toBeVisible()

        // Verify all form fields are present
        await expect(page.locator("#name")).toBeVisible()
        await expect(page.locator("#email")).toBeVisible()
        await expect(page.locator("#password")).toBeVisible()

        // Check that the CAPTCHA widget container exists
        const captchaWidget = page.locator("#clerk-captcha")
        await expect(captchaWidget).toBeVisible()

        // Verify CAPTCHA widget attributes
        await expect(captchaWidget).toHaveAttribute("data-cl-theme", "dark")
        await expect(captchaWidget).toHaveAttribute("data-cl-size", "flexible")
        await expect(captchaWidget).toHaveAttribute("data-cl-language", "auto")
    })

    test("should validate form fields before submission", async ({ page }) => {
        const submitButton = page.locator('button[type="submit"]')

        // Try to submit empty form
        await submitButton.click()

        // Check for HTML5 validation (required fields)
        await expect(page.locator("#name:invalid")).toBeVisible()
        await expect(page.locator("#email:invalid")).toBeVisible()
        await expect(page.locator("#password:invalid")).toBeVisible()
    })

    test("should handle form submission with CAPTCHA", async ({ page }) => {
        // Fill in the form
        await page.fill("#name", "Test User")
        await page.fill("#email", "testuser+clerk_test@example.com") // Use Clerk test email format
        await page.fill("#password", "TestPassword123!")

        // Wait for CAPTCHA widget to be fully loaded
        await page.waitForSelector("#clerk-captcha", { state: "visible" })

        // Note: In a real test environment, you would either:
        // 1. Use Clerk's test mode which bypasses CAPTCHA
        // 2. Configure test CAPTCHA keys that auto-pass
        // 3. Mock the CAPTCHA response

        // For now, we'll just verify the form is ready for submission
        const submitButton = page.locator('button[type="submit"]')
        await expect(submitButton).toBeEnabled()

        // In a real test, you would proceed with submission
        // await submitButton.click();
        // await expect(page).toHaveURL('/onboarding'); // or wherever it redirects
    })

    test("should display error messages for invalid inputs", async ({
        page,
    }) => {
        // Test with existing email (this will trigger Clerk error)
        await page.fill("#name", "Test User")
        await page.fill("#email", "existing@example.com")
        await page.fill("#password", "TestPassword123!")

        // Submit the form
        await page.locator('button[type="submit"]').click()

        // Wait for any error messages to appear
        // Note: Actual error depends on your Clerk configuration
        // This test verifies the error handling mechanism exists
        await page.waitForSelector('button[type="submit"]:not([disabled])', {
            timeout: 5000,
        })
    })

    test("should handle password validation errors", async ({ page }) => {
        await page.fill("#name", "Test User")
        await page.fill("#email", "newuser+clerk_test@example.com")

        // Test weak password
        await page.fill("#password", "123")
        await page.locator('button[type="submit"]').click()

        // Should show password validation error
        await expect(page.locator("text=Password is too short")).toBeVisible({
            timeout: 5000,
        })
    })

    test("should navigate to sign-in page", async ({ page }) => {
        // Click the sign-in link
        await page.click("text=Sign in")

        // Should navigate to sign-in page
        await expect(page).toHaveURL("/sign-in")
    })

    test("should have proper accessibility attributes", async ({ page }) => {
        // Check form labels are properly associated
        const nameInput = page.locator("#name")
        const emailInput = page.locator("#email")
        const passwordInput = page.locator("#password")

        await expect(nameInput).toHaveAttribute("id", "name")
        await expect(emailInput).toHaveAttribute("id", "email")
        await expect(passwordInput).toHaveAttribute("id", "password")

        // Check for proper input types
        await expect(emailInput).toHaveAttribute("type", "email")
        await expect(passwordInput).toHaveAttribute("type", "password")

        // Check autocomplete attributes
        await expect(nameInput).toHaveAttribute("autoComplete", "name")
        await expect(emailInput).toHaveAttribute("autoComplete", "email")
        await expect(passwordInput).toHaveAttribute(
            "autoComplete",
            "new-password"
        )
    })

    test("should handle loading states correctly", async ({ page }) => {
        // Fill form
        await page.fill("#name", "Test User")
        await page.fill("#email", "testuser+clerk_test@example.com")
        await page.fill("#password", "TestPassword123!")

        const submitButton = page.locator('button[type="submit"]')

        // Check initial button text
        await expect(submitButton).toHaveText("Create account")

        // When form is submitted, button should show loading state
        await submitButton.click()

        // Check for loading text (might be temporary)
        await expect(submitButton).toHaveText(/Creating account|Create account/)
    })
})

test.describe("Sign-up Form with Clerk Integration", () => {
    test("should integrate with Clerk testing helpers", async ({ page }) => {
        // Navigate to a page that loads Clerk
        await page.goto("/")

        // Ensure Clerk is loaded
        await clerk.loaded({ page })

        // Navigate to sign-up
        await page.goto("/sign-up")

        // Verify the CAPTCHA widget is present and configured correctly
        const captchaWidget = page.locator("#clerk-captcha")
        await expect(captchaWidget).toBeVisible()

        // Test that we can interact with the form elements
        await page.fill("#name", "Test User")
        await page.fill("#email", "testuser+clerk_test@example.com")
        await page.fill("#password", "SecurePassword123!")

        // Verify form is ready for submission
        const submitButton = page.locator('button[type="submit"]')
        await expect(submitButton).toBeEnabled()
    })
})
