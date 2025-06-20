/** @format */

"use server"

import { getCurrentUser } from "@/lib/auth/auth"
import db from "@/lib/database/db"
import { handleError } from "@/lib/errors/handleError"
import { z } from "zod"

const scheduleInspectionSchema = z.object({
    vehicleId: z.string().min(1),
    inspectionDate: z.string().min(1),
    inspector: z.string().optional(),
    notes: z.string().optional(),
})

export async function scheduleVehicleInspection(
    data: z.infer<typeof scheduleInspectionSchema>
) {
    try {
        const user = await getCurrentUser()
        if (!user?.organizationId) throw new Error("Unauthorized")
        const validated = scheduleInspectionSchema.parse(data)
        const inspectionDate = new Date(validated.inspectionDate)
        await db.vehicle.update({
            where: { id: validated.vehicleId },
            data: {
                lastInspectionDate: inspectionDate,
                nextInspectionDue: null,
            },
        })
        await db.complianceAlert.create({
            data: {
                organizationId: user.organizationId,
                userId: user.userId,
                vehicleId: validated.vehicleId,
                driverId: undefined,
                type: "inspection_due",
                severity: "low",
                title: "Vehicle Inspected",
                message: `Vehicle inspected on ${inspectionDate
                    .toISOString()
                    .slice(0, 10)}`,
                entityType: "vehicle",
                entityId: validated.vehicleId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        })
        return { success: true }
    } catch (error) {
        return handleError(error, "Schedule Vehicle Inspection")
    }
}
