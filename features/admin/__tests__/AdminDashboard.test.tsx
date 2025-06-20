/** @format */

// @vitest-environment jsdom
import React from "react"
import { screen } from "@testing-library/dom"
import "@testing-library/jest-dom" // Add this import
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AdminDashboard } from "../AdminDashboard"

vi.mock("@/lib/actions/adminActions", () => ({
    getOrganizationStatsAction: vi.fn(async () => ({
        success: true,
        data: {
            userCount: 5,
            activeUserCount: 4,
            vehicleCount: 3,
            driverCount: 2,
            loadCount: 1,
        },
    })),
}))

// Mock the UI components
vi.mock("@/components/ui/card", () => ({
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
    CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}))

describe("AdminDashboard", () => {
    it("renders organization stats", async () => {
        const Component = await AdminDashboard({ orgId: "org1" })
        render(Component)
        expect(screen.getByText("Total Users")).toBeInTheDocument()
        expect(screen.getByText("5")).toBeInTheDocument()
    })
})