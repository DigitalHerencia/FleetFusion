/** @format */

import { describe, expect, it } from "vitest"
import { calculateHosStatus } from "../../../lib/utils/hos"
import type { HosLog } from "../../../types/compliance"

function makeLog(hours: number, status: "driving" | "on_duty"): HosLog {
    // Use the start of today in UTC to align with calculation logic
    const now = new Date()
    const start = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0,
            0,
            0
        )
    )
    const logs = [] as any[]
    for (let i = 0; i < hours; i++) {
        const s = new Date(start.getTime() + i * 3600 * 1000)
        const e = new Date(start.getTime() + (i + 1) * 3600 * 1000)
        logs.push({
            id: `entry-${i}`,
            status,
            location: "A",
            startTime: s.toISOString(),
            endTime: e.toISOString(),
            automaticEntry: false,
            source: "manual" as const,
        })
    }
    return {
        id: "h1",
        tenantId: "tenant1",
        driverId: "d1",
        date: now,
        status: "pending_review" as const,
        logs,
        breaks: [],
        totalDriveTime: 0,
        totalOnDutyTime: 0,
        totalOffDutyTime: 0,
        sleeperBerthTime: 0,
        personalConveyanceTime: 0,
        yardMovesTime: 0,
        createdAt: now,
        updatedAt: now,
    } as HosLog
}

describe("calculateHosStatus", () => {
    it("flags violation when driving exceeds 11 hours", () => {
        const status = calculateHosStatus("d1", [makeLog(12, "driving")])
        // Debug output for inspection
        // console.log(status)
        expect(status.violations.length).toBeGreaterThan(0)
        expect(status.complianceStatus).toBe("violation")
    })

    it("does not flag violation when driving is exactly 11 hours", () => {
        const status = calculateHosStatus("d1", [makeLog(11, "driving")])
        expect(status.violations.length).toBe(0)
        expect(status.complianceStatus).toBe("compliant")
    })

    it("does not flag violation when driving is less than 11 hours", () => {
        const status = calculateHosStatus("d1", [makeLog(10, "driving")])
        expect(status.violations.length).toBe(0)
        expect(status.complianceStatus).toBe("compliant")
    })
})
