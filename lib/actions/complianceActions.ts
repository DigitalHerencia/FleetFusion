/** @format */

"use server"

import { z } from "zod"

import { getCurrentUser } from "@/lib/auth/auth"
import { handleError } from "@/lib/errors/handleError"
import type { UpdateComplianceDocumentInput } from "@/schemas/compliance"
import {
    bulkComplianceOperationSchema,
    createComplianceDocumentSchema,
    createDvirSchema,
    updateComplianceDocumentSchema,
} from "@/schemas/compliance"

import db from "../database/db"
import { createAuditLog } from "./auditLogActions"

// Document Management Actions
export async function createComplianceDocument(
    data: z.infer<typeof createComplianceDocumentSchema>
) {
    try {
        const user = await getCurrentUser()
        const userId = user?.userId
        const orgId = user?.organizationId

        if (!userId || !orgId) {
            throw new Error("Unauthorized")
        }

        // Validate input
        const validatedData = createComplianceDocumentSchema.parse(data)

        // Map entityType/entityId to driverId/vehicleId
        let driverId: string | undefined = undefined
        let vehicleId: string | undefined = undefined
        if (validatedData.entityType === "driver") {
            driverId = validatedData.entityId
        } else if (validatedData.entityType === "vehicle") {
            vehicleId = validatedData.entityId
        }

        // Check if document already exists for driver/vehicle if applicable
        if (driverId || vehicleId) {
            const existingDoc = await db.complianceDocument.findFirst({
                where: {
                    organizationId: orgId,
                    type: validatedData.type,
                    driverId,
                    vehicleId,
                    expirationDate: { gte: new Date() },
                },
            })
            if (existingDoc) {
                throw new Error("A valid document of this type already exists")
            }
        }

        const document = await db.complianceDocument.create({
            data: {
                organizationId: orgId,
                driverId,
                vehicleId,
                type: validatedData.type,
                title: validatedData.name,
                documentNumber: validatedData.documentNumber,
                issuingAuthority: validatedData.issuingAuthority,
                fileUrl: undefined, // File upload handled elsewhere
                fileName: undefined,
                fileSize: undefined,
                mimeType: undefined,
                issueDate: validatedData.issuedDate
                    ? new Date(validatedData.issuedDate)
                    : undefined,
                expirationDate: validatedData.expirationDate
                    ? new Date(validatedData.expirationDate)
                    : undefined,
                status: "active",
                isVerified: false,
                notes: validatedData.notes,
                tags: validatedData.tags,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            include: {
                driver: {
                    select: { id: true, firstName: true, lastName: true },
                },
                vehicle: {
                    select: {
                        id: true,
                        unitNumber: true,
                        make: true,
                        model: true,
                    },
                },
            },
        })

        // Audit log
        await createAuditLog({
            organizationId: orgId,
            userId,
            entityType: "ComplianceDocument",
            entityId: document.id,
            action: "create",
            changes: document,
        })

        // Create alert if document is expiring or expired
        if (
            document.expirationDate &&
            new Date(document.expirationDate) < new Date()
        ) {
            await db.complianceAlert.create({
                data: {
                    organizationId: orgId,
                    userId,
                    ...(driverId ? { driverId } : {}),
                    ...(vehicleId ? { vehicleId } : {}),
                    type: "expiring_document",
                    severity: "high",
                    title: "Document Expired",
                    message: `Document ${document.title} has expired.`,
                    entityType: "compliance_document",
                    entityId: document.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            })
        }

        return { success: true, data: document }
    } catch (error) {
        return handleError(error, "Compliance Action")
    }
}

export async function updateComplianceDocument(
    id: string,
    data: z.infer<typeof updateComplianceDocumentSchema>
) {
    try {
        const user = await getCurrentUser()
        const userId = user?.userId
        const orgId = user?.organizationId

        if (!userId || !orgId) {
            throw new Error("Unauthorized")
        }

        const validatedData = updateComplianceDocumentSchema.parse(data)

        const existingDocument = await db.complianceDocument.findFirst({
            where: { id, organizationId: orgId },
        })
        if (!existingDocument) {
            throw new Error("Document not found")
        }

        // Map name to title if present
        const updateData: Partial<UpdateComplianceDocumentInput> & {
            updatedAt: Date
            title?: string
        } = {
            ...validatedData,
            updatedAt: new Date(),
        }
        if (validatedData.name) {
            updateData.title = validatedData.name
            delete updateData.name
        }
        if (validatedData.expirationDate) {
            updateData.expirationDate = new Date(
                validatedData.expirationDate
            ).toISOString()
        }

        const updatedDocument = await db.complianceDocument.update({
            where: { id },
            data: updateData,
            include: {
                driver: {
                    select: { id: true, firstName: true, lastName: true },
                },
                vehicle: {
                    select: {
                        id: true,
                        unitNumber: true,
                        make: true,
                        model: true,
                    },
                },
            },
        })

        // Audit log
        await createAuditLog({
            organizationId: orgId,
            userId,
            entityType: "ComplianceDocument",
            entityId: updatedDocument.id,
            action: "update",
            changes: updateData,
        })

        // Create alert if document is expiring or expired
        if (
            updatedDocument.expirationDate &&
            new Date(updatedDocument.expirationDate) < new Date()
        ) {
            await db.complianceAlert.create({
                data: {
                    organizationId: orgId,
                    userId,
                    ...(updatedDocument.driverId && {
                        driverId: updatedDocument.driverId,
                    }),
                    ...(updatedDocument.vehicleId && {
                        vehicleId: updatedDocument.vehicleId,
                    }),
                    type: "expiring_document",
                    severity: "high",
                    title: "Document Expired",
                    message: `Document ${updatedDocument.title} has expired.`,
                    entityType: "compliance_document",
                    entityId: updatedDocument.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            })
        }

        return { success: true, data: updatedDocument }
    } catch (error) {
        return handleError(error, "Compliance Action")
    }
}

export async function deleteComplianceDocument(id: string) {
    try {
        const user = await getCurrentUser()
        const userId = user?.userId
        const orgId = user?.organizationId

        if (!userId || !orgId) {
            throw new Error("Unauthorized")
        }

        // Get document for audit log
        const document = await db.complianceDocument.findFirst({
            where: { id, organizationId: orgId },
        })
        if (!document) {
            throw new Error("Document not found")
        }

        await db.complianceDocument.delete({
            where: { id },
        })

        // Audit log
        await createAuditLog({
            organizationId: orgId,
            userId,
            entityType: "ComplianceDocument",
            entityId: id,
            action: "delete",
            changes: document,
        })

        return { success: true }
    } catch (error) {
        return handleError(error, "Compliance Action")
    }
}

// DVIR Management Actions
export async function createDVIRReport(data: z.infer<typeof createDvirSchema>) {
    try {
        const authData = await getCurrentUser()
        const userId = authData?.userId

        if (!userId) {
            throw new Error("Unauthorized")
        }

        // Validate input

        // Create audit log
        // await createAuditLog({
        //   action: 'CREATE',
        //   resource: 'dvir_report',
        //   resourceId: dvirReport.id,
        //   details: {
        //     vehicleId: dvirReport.vehicleId,
        //     driverId: dvirReport.driverId,
        //     defectsFound: dvirReport.defectsFound,
        //     inspectionType: dvirReport.inspectionType
        //   },
        //   userId,
        //   organizationId: orgId
        // });

        // revalidatePath('/[orgId]/compliance/dvir');
    } catch (error) {
        return handleError(error, "Compliance Action")
    }
}

// Maintenance Management Actions

// Create audit log
// await createAuditLog({
//   action: 'CREATE',
//   resource: 'maintenance_record',
//   resourceId: maintenanceRecord.id,
//   details: {
//     vehicleId: maintenanceRecord.vehicleId,
//     type: maintenanceRecord.type,
//     cost: maintenanceRecord.cost
//   },
//   userId,
//   organizationId: orgId
// });

// revalidatePath('/[orgId]/compliance/maintenance');

// Safety Event Management Actions

// Create audit log
// await createAuditLog({
//   action: 'CREATE',
//   resource: 'safety_event',
//   resourceId: safetyEvent.id,
//   details: {
//     type: safetyEvent.type,
//     severity: safetyEvent.severity,
//     driverId: safetyEvent.driverId,
//     vehicleId: safetyEvent.vehicleId
//   },
//   userId,
//   organizationId: orgId
// });

// revalidatePath('/[orgId]/compliance/safety');

// Bulk Operations
export async function bulkUpdateComplianceDocuments(
    data: z.infer<typeof bulkComplianceOperationSchema>
) {
    try {
        const user = await getCurrentUser()
        const userId = user?.userId
        const orgId = user?.organizationId

        if (!userId || !orgId) {
            throw new Error("Unauthorized")
        }

        const validatedData = bulkComplianceOperationSchema.parse(data)

        const results = await Promise.allSettled(
            validatedData.ids.map(async (documentId: string) => {
                const updated = await db.complianceDocument.update({
                    where: {
                        id: documentId,
                        organizationId: orgId,
                    },
                    data: {
                        ...validatedData.data,
                        updatedAt: new Date(),
                    },
                })
                // Audit log for each bulk update
                await createAuditLog({
                    organizationId: orgId,
                    userId,
                    entityType: "ComplianceDocument",
                    entityId: documentId,
                    action: "bulk_update",
                    changes: validatedData.data,
                })
                return updated
            })
        )

        const successful = results.filter(
            (r: any) => r.status === "fulfilled"
        ).length
        const failed = results.filter(
            (r: any) => r.status === "rejected"
        ).length

        return {
            success: true,
            data: { successful, failed, total: validatedData.ids.length },
        }
    } catch (error) {
        return handleError(error, "Compliance Action")
    }
}

// Alert Management

// Helper Functions
// async function checkHOSViolations(driverId: string, orgId: string, userId: string) {
//   // Get driver's HOS logs for the past 7 days
//   const sevenDaysAgo = new Date();
//   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//   const hosLogs = await db.hOSLog.findMany({
//     where: {
//       driverId,
//       organizationId: orgId,
//       startTime: {
//         gte: sevenDaysAgo
//       }
//     },
//     orderBy: { startTime: 'asc' }
//   });

//   // Check for various HOS violations
//   const violations = [];

//   // Check 11-hour driving limit
//   const drivingHours = hosLogs
//     .filter(log => log.dutyStatus === 'driving')
//     .reduce((total, log) => total + log.duration, 0);

//   if (drivingHours > 11 * 60) { // 11 hours in minutes
//     violations.push({
//       type: 'driving_limit_exceeded',
//       severity: 'high' as const,
//       message: `Driver exceeded 11-hour driving limit (${Math.round(drivingHours / 60 * 10) / 10} hours)`
//     });
//   }

//   // Check 14-hour on-duty limit
//   const onDutyHours = hosLogs
//     .filter(log => ['driving', 'on_duty_not_driving'].includes(log.dutyStatus))
//     .reduce((total, log) => total + log.duration, 0);

//   if (onDutyHours > 14 * 60) { // 14 hours in minutes
//     violations.push({
//       type: 'on_duty_limit_exceeded',
//       severity: 'high' as const,
//       message: `Driver exceeded 14-hour on-duty limit (${Math.round(onDutyHours / 60 * 10) / 10} hours)`
//     });
//   }

//   // Create alerts for violations
//   for (const violation of violations) {
//     await db.complianceAlert.create({
//       data: {
//         organizationId: orgId,
//         type: 'hos_violation',
//         severity: violation.severity,
//         title: 'HOS Violation Detected',
//         message: violation.message,
//         driverId,
//         createdBy: userId
//       }
//     });
//   }
// }

export async function generateExpirationAlertsAction(daysAhead = 30) {
    try {
        const user = await getCurrentUser()
        const userId = user?.userId
        const orgId = user?.organizationId
        if (!userId || !orgId) {
            throw new Error("Unauthorized")
        }

        const today = new Date()
        const dueDate = new Date(
            today.getTime() + daysAhead * 24 * 60 * 60 * 1000
        )

        const documents = await db.complianceDocument.findMany({
            where: {
                organizationId: orgId,
                expirationDate: {
                    gte: today,
                    lte: dueDate,
                },
            },
            select: {
                id: true,
                driverId: true,
                vehicleId: true,
                title: true,
                expirationDate: true,
            },
        })

        await Promise.all(
            documents.map(async doc => {
                const existing = await db.complianceAlert.findFirst({
                    where: {
                        organizationId: orgId,
                        type: "expiring_document",
                    },
                })
                if (existing) return

                const daysLeft = Math.ceil(
                    (doc.expirationDate!.getTime() - today.getTime()) /
                        (24 * 60 * 60 * 1000)
                )
                await db.complianceAlert.create({
                    data: {
                        organizationId: orgId,
                        userId,
                        driverId: doc.driverId || undefined,
                        vehicleId: doc.vehicleId || undefined,
                        type: "expiring_document",
                        severity: daysLeft <= 7 ? "high" : "medium",
                        title: "Document Expiring",
                        message: `${doc.title} expires in ${daysLeft} days`,
                        entityType: "compliance_document",
                        entityId: doc.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                })
            })
        )

        return { success: true, count: documents.length }
    } catch (error) {
        return handleError(error, "Generate Expiration Alerts")
    }
}
