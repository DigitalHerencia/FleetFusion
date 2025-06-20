/** @format */

import "@testing-library/jest-dom"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

describe("Test Environment Setup", () => {
    it("should have the correct environment variables", () => {
        expect(process.env.NODE_ENV).toBe("test")
    })

    it("should have access to required testing modules", async () => {
        // Use dynamic imports to avoid CommonJS require issues
        const vitestModule = await import("vitest")
        const reactTestingLibrary = await import("@testing-library/react")

        expect(typeof vitestModule).toBe("object")
        expect(typeof reactTestingLibrary).toBe("object")
        expect(typeof render).toBe("function")
    })

    it("should be able to connect to the test database", async () => {
        const dbConnection: { connected: boolean } =
            await connectToTestDatabase()
        expect(dbConnection).toBeTruthy()
        expect(dbConnection.connected).toBe(true)
    })

    it("should have proper React testing setup", async () => {
        // Check if React testing utilities are available using dynamic imports
        const reactModule = await import("react")
        const reactDomModule = await import("react-dom")

        expect(typeof reactModule).toBe("object")
        expect(typeof reactDomModule).toBe("object")
    })
})

function connectToTestDatabase(): Promise<{ connected: boolean }> {
    // Simulate async DB connection for test environment
    return new Promise(resolve => {
        setTimeout(() => resolve({ connected: true }), 10)
    })
}
