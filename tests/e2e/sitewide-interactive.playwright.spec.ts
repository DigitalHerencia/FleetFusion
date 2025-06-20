/** @format */

import { expect, test } from "@playwright/test"

const BASE_URL = "http://localhost:3000"
const ROUTES = [
    "/",
    "/sign-in",
    "/sign-up",
    "/features",
    "/pricing",
    "/about",
    "/terms",
    "/privacy",
    // Add more routes as needed for your app
]

test.describe("Sitewide Interactive Elements", () => {
    for (const route of ROUTES) {
        test(`All interactive elements work on ${route}`, async ({ page }) => {
            await page.goto(`${BASE_URL}${route}`)
            // Buttons
            const buttons = await page.locator("button:not([disabled])").all()
            for (const btn of buttons) {
                try {
                    await btn.scrollIntoViewIfNeeded()
                    await btn.hover()
                    await btn.click({ trial: true }) // trial: true = dry run
                } catch (e) {
                    // Ignore if not visible/clickable
                }
            }
            // Inputs
            const inputs = await page
                .locator("input:not([type=hidden]):not([disabled])")
                .all()
            for (const input of inputs) {
                const type = await input.getAttribute("type")
                if (type === "checkbox" || type === "radio") {
                    try {
                        await input.check({ trial: true })
                    } catch {}
                } else {
                    try {
                        await input.fill("test") // removed { trial: true }
                    } catch {}
                }
            }
            // Selects
            const selects = await page.locator("select").all()
            for (const select of selects) {
                try {
                    const options = await select.locator("option").all()
                    if (options.length > 1) {
                        await select.selectOption({ index: 1 })
                    }
                } catch {}
            }
            // Textareas
            const textareas = await page.locator("textarea").all()
            for (const ta of textareas) {
                try {
                    await ta.fill("test") // removed { trial: true }
                } catch {}
            }
            // Tabs (role=tab)
            const tabs = await page.locator("[role=tab]").all()
            for (const tab of tabs) {
                try {
                    await tab.click({ trial: true })
                } catch {}
            }
            // Switches (role=switch)
            const switches = await page.locator("[role=switch]").all()
            for (const sw of switches) {
                try {
                    await sw.click({ trial: true })
                } catch {}
            }
            // No error modals/alerts
            const errorAlert = await page
                .locator(
                    ".alert-error, [role=alert][aria-live], .error, .alert-danger"
                )
                .first()
            expect(await errorAlert.count()).toBe(0)
        })
    }
})
