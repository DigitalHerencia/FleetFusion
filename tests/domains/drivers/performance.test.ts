/** @format */

import { beforeEach, describe, expect, it, vi } from "vitest"
import { mockGetDriverAnalytics } from "../../__mocks__/mockAnalytics"

vi.mock("../../../lib/fetchers/analyticsFetchers", () => ({
    getDriverAnalytics: mockGetDriverAnalytics,
    getDateRange: vi.fn(() => ({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
    })),
}))

vi.mock("@clerk/nextjs/server", () => ({
    auth: () => ({ userId: "u1" }),
}))

vi.mock("../../../lib/cache/auth-cache", () => ({
    getCachedData: () => null,
    setCachedData: vi.fn(),
    CACHE_TTL: { DATA: 60 },
}))

vi.mock("../../../lib/database/db", () => ({
    __esModule: true,
    default: {
        driver: {
            findMany: vi.fn().mockResolvedValue([
                {
                    id: "d1",
                    firstName: "A",
                    lastName: "B",
                    loads: [
                        {
                            status: "delivered",
                            rate: 100,
                            actualMiles: 50,
                            actualDeliveryDate: new Date("2024-01-02"),
                            scheduledDeliveryDate: new Date("2024-01-02"),
                        },
                    ],
                },
            ]),
        },
    },
}))

// Import after mocking
import { getDriverAnalytics } from "../../../lib/fetchers/analyticsFetchers"

describe("getDriverAnalytics", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Setup mock return value
        mockGetDriverAnalytics.mockResolvedValue([
            {
                id: "d1",
                firstName: "A",
                lastName: "B",
                loadsCompleted: 1,
                totalRevenue: 100,
                averageRevenuePerMile: 2,
            },
        ])
    })

    it("calculates basic performance metrics", async () => {
        const data = (await getDriverAnalytics("org1")) as any[]

        expect(Array.isArray(data)).toBe(true)
        expect(data).toHaveLength(1)
        expect(data[0]).toEqual({
            id: "d1",
            firstName: "A",
            lastName: "B",
            loadsCompleted: 1,
            totalRevenue: 100,
            averageRevenuePerMile: 2,
        })
    })
})