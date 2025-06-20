/** @format */

import { Page, BrowserContext } from "@playwright/test"

export interface TestAuthOptions {
    userId?: string
    role?: "admin" | "dispatcher" | "driver" | "compliance" | "member"
    organizationId?: string
    email?: string
    firstName?: string
    lastName?: string
}

/**
 * Authentication helper for Playwright tests
 * Sets up test authentication state by adding custom headers
 */
export class TestAuth {
    private page: Page
    private context: BrowserContext

    constructor(page: Page, context: BrowserContext) {
        this.page = page
        this.context = context
    }

    /**
     * Login as a test user with specified role and organization
     */
    async loginAs(options: TestAuthOptions = {}) {
        const authData = {
            userId: options.userId || "user_admin123",
            role: options.role || "admin",
            organizationId: options.organizationId || "org1",
            email: options.email || "test@example.com",
            firstName: options.firstName || "Test",
            lastName: options.lastName || "User",
        }

        // Set custom header for test authentication bypass
        await this.context.setExtraHTTPHeaders({
            "x-test-auth": JSON.stringify(authData),
        })

        return authData
    }

    /**
     * Login as admin user
     */
    async loginAsAdmin(organizationId = "org1") {
        return this.loginAs({
            userId: "user_admin123",
            role: "admin",
            organizationId,
            email: "admin@test.com",
            firstName: "Admin",
            lastName: "User",
        })
    }

    /**
     * Login as driver user
     */
    async loginAsDriver(organizationId = "org1") {
        return this.loginAs({
            userId: "user_driver123",
            role: "driver",
            organizationId,
            email: "driver@test.com",
            firstName: "Test",
            lastName: "Driver",
        })
    }

    /**
     * Login as dispatcher user
     */
    async loginAsDispatcher(organizationId = "org1") {
        return this.loginAs({
            userId: "user_dispatcher123",
            role: "dispatcher",
            organizationId,
            email: "dispatcher@test.com",
            firstName: "Test",
            lastName: "Dispatcher",
        })
    }

    /**
     * Login as compliance user
     */
    async loginAsCompliance(organizationId = "org1") {
        return this.loginAs({
            userId: "user_compliance123",
            role: "compliance",
            organizationId,
            email: "compliance@test.com",
            firstName: "Test",
            lastName: "Compliance",
        })
    }

    /**
     * Clear authentication state
     */
    async logout() {
        await this.context.setExtraHTTPHeaders({})
    }

    /**
     * Navigate to a tenant-specific route with proper authentication
     */
    async navigateToTenant(
        route: string,
        options: TestAuthOptions = {}
    ): Promise<string> {
        const authData = await this.loginAs(options)
        const fullRoute = `/${authData.organizationId}${route}`
        await this.page.goto(fullRoute)
        return fullRoute
    }

    /**
     * Navigate to user's dashboard
     */
    async goToDashboard(options: TestAuthOptions = {}) {
        const authData = await this.loginAs(options)
        const dashboardRoute = `/${authData.organizationId}/dashboard/${authData.userId}`
        await this.page.goto(dashboardRoute)
        return dashboardRoute
    }
}

/**
 * Create a test auth helper for a page
 */
export function createTestAuth(page: Page, context: BrowserContext): TestAuth {
    return new TestAuth(page, context)
}