/** @format */

import { devices, type PlaywrightTestConfig } from "@playwright/test"

const config = {
    testDir: "./tests",
    timeout: 90 * 1000, // Increased for complex auth flows
    expect: {
        timeout: 20000, // More time for auth operations
    },
    fullyParallel: false, // Critical for auth test stability
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 3 : 2, // More retries for flaky auth
    workers: 1, // Sequential execution for auth tests
    reporter: [
        ["list"],
        ["html", { outputFolder: "playwright-report" }],
        ["json", { outputFile: "test-results/results.json" }],
    ],
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        navigationTimeout: 45000, // Longer for auth redirects
        actionTimeout: 20000, // More time for form submissions
    },
    projects: [
        {
            name: "setup",
            testMatch: "**/test-setup.global.ts",
        },
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
            dependencies: ["setup"],
        },
    ],
    outputDir: "test-results/",
} satisfies PlaywrightTestConfig

export default config
