/** @format */

"use server"

import { handleError } from "@/lib/errors/handleError"
import { runRegulatoryAuditSchema } from "@/schemas/regulatory"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { getRegulatoryComplianceSummary } from "../compliance/regulatoryEngine"

// Validation and auth pattern per CONTRIBUTING.md#L596-L618

export async function runRegulatoryAudit(
    organizationId: string,
    quarter: string,
    year: number
) {
    try {
        const { userId, orgId } = await auth()
        if (!userId || orgId !== organizationId) {
            return { success: false, error: "Unauthorized" }
        }

        const parsed = runRegulatoryAuditSchema.parse({
            organizationId,
            quarter,
            year,
        })

        const summary = await getRegulatoryComplianceSummary(
            parsed.organizationId,
            parsed.quarter,
            parsed.year
        )

        revalidatePath(`/${parsed.organizationId}/compliance/audits`)
    } catch (error) {
        return handleError(error, "Run Regulatory Audit")
    }
}
