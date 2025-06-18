"use server"

/** @format */

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import db from "@/lib/database/db"
import { handleError } from "@/lib/errors/handleError"
import { getOrganizationKPIs } from "@/lib/fetchers/kpiFetchers"
import type { OrganizationKPIs } from "@/types/kpi"

export interface DashboardActionResult<T = unknown> {
    success: boolean
    error?: string
    data?: T
}

/**
 * Get dashboard overview statistics
 */
export async function getDashboardOverviewAction(): Promise<
    DashboardActionResult<OrganizationKPIs>
> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: "Unauthorized" }
        }

        const user = await db.user.findUnique({
            where: { clerkId: userId },
            select: { organizationId: true, role: true },
        })

        if (!user?.organizationId) {
            return { success: false, error: "User organization not found" }
        }

        const overview = await getOrganizationKPIs(user.organizationId)

        // Revalidate to keep dashboard data fresh
        revalidatePath("/dashboard")
        revalidatePath("/")

        return { success: true, data: overview }
    } catch (error) {
        return handleError(error, "Get Dashboard Overview")
    }
}

/**
 * Get dashboard alerts and notifications
 */
export type DashboardAlert = {
    id: string
    message: string
    severity: "high" | "medium" | "low"
    timestamp: string
    type: string
}

export async function getDashboardAlertsAction(
    organizationId: string
): Promise<DashboardActionResult<DashboardAlert[]>> {
    if (!organizationId) {
        return { success: false, error: "Organization ID is required." }
    }
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: "Unauthorized" }
        }

        const alerts: Array<{
            id: string
            message: string
            severity: string
            timestamp: string
            type: string
        }> = []
        const today = new Date()
        const thirtyDaysFromNow = new Date(today)
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        // 1. Vehicle maintenance alerts
        const vehicleMaintenanceAlerts = await db.vehicle.findMany({
            where: {
                organizationId,
                OR: [
                    {
                        nextInspectionDue: {
                            lte: thirtyDaysFromNow,
                        },
                    },
                    {
                        insuranceExpiration: {
                            lte: thirtyDaysFromNow,
                        },
                    },
                    {
                        registrationExpiration: {
                            lte: thirtyDaysFromNow,
                        },
                    },
                ],
            },
            select: {
                id: true,
                unitNumber: true,
                nextInspectionDue: true,
                insuranceExpiration: true,
                registrationExpiration: true,
            },
        })

        vehicleMaintenanceAlerts.forEach(vehicle => {
            if (
                vehicle.nextInspectionDue &&
                vehicle.nextInspectionDue <= thirtyDaysFromNow
            ) {
                const daysUntilDue = Math.ceil(
                    (vehicle.nextInspectionDue.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                )
                alerts.push({
                    id: `vehicle-inspection-${vehicle.id}`,
                    message: `Vehicle ${vehicle.unitNumber} inspection ${
                        daysUntilDue <= 0
                            ? "overdue"
                            : `due in ${daysUntilDue} days`
                    }`,
                    severity: daysUntilDue <= 7 ? "high" : "medium",
                    timestamp: new Date().toISOString(),
                    type: "vehicle_maintenance",
                })
            }

            if (
                vehicle.insuranceExpiration &&
                vehicle.insuranceExpiration <= thirtyDaysFromNow
            ) {
                const daysUntilDue = Math.ceil(
                    (vehicle.insuranceExpiration.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                )
                alerts.push({
                    id: `vehicle-insurance-${vehicle.id}`,
                    message: `Vehicle ${vehicle.unitNumber} insurance ${
                        daysUntilDue <= 0
                            ? "expired"
                            : `expires in ${daysUntilDue} days`
                    }`,
                    severity: daysUntilDue <= 7 ? "high" : "medium",
                    timestamp: new Date().toISOString(),
                    type: "vehicle_insurance",
                })
            }
        })

        // 2. Driver license expiration alerts
        const driverAlerts = await db.driver.findMany({
            where: {
                organizationId,
                status: "active",
                OR: [
                    {
                        licenseExpiration: {
                            lte: thirtyDaysFromNow,
                        },
                    },
                    {
                        medicalCardExpiration: {
                            lte: thirtyDaysFromNow,
                        },
                    },
                ],
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                licenseExpiration: true,
                medicalCardExpiration: true,
            },
        })

        driverAlerts.forEach(driver => {
            if (
                driver.licenseExpiration &&
                driver.licenseExpiration <= thirtyDaysFromNow
            ) {
                const daysUntilDue = Math.ceil(
                    (driver.licenseExpiration.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                )
                alerts.push({
                    id: `driver-license-${driver.id}`,
                    message: `Driver ${driver.firstName} ${
                        driver.lastName
                    } license ${
                        daysUntilDue <= 0
                            ? "expired"
                            : `expires in ${daysUntilDue} days`
                    }`,
                    severity: daysUntilDue <= 7 ? "high" : "medium",
                    timestamp: new Date().toISOString(),
                    type: "driver_license",
                })
            }

            if (
                driver.medicalCardExpiration &&
                driver.medicalCardExpiration <= thirtyDaysFromNow
            ) {
                const daysUntilDue = Math.ceil(
                    (driver.medicalCardExpiration.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                )
                alerts.push({
                    id: `driver-medical-${driver.id}`,
                    message: `Driver ${driver.firstName} ${
                        driver.lastName
                    } medical card ${
                        daysUntilDue <= 0
                            ? "expired"
                            : `expires in ${daysUntilDue} days`
                    }`,
                    severity: daysUntilDue <= 7 ? "high" : "medium",
                    timestamp: new Date().toISOString(),
                    type: "driver_medical",
                })
            }
        })

        // 3. Load-related alerts (overdue, unassigned)
        const overdueLoads = await db.load.findMany({
            where: {
                organizationId,
                status: "assigned",
                scheduledPickupDate: {
                    lt: today,
                },
            },
            select: {
                id: true,
                loadNumber: true,
                customerName: true,
            },
            take: 5, // Limit to recent alerts
        })

        overdueLoads.forEach(load => {
            alerts.push({
                id: `load-overdue-${load.id}`,
                message: `Load ${load.loadNumber} pickup is overdue (Customer: ${load.customerName})`,
                severity: "high",
                timestamp: new Date().toISOString(),
                type: "load_overdue",
            })
        })

        // Sort alerts by severity and timestamp
        const severityOrder: { [key: string]: number } = {
            high: 3,
            medium: 2,
            low: 1,
        }
        const sortedAlerts = alerts.sort((a, b) => {
            const aSeverity = severityOrder[a.severity] ?? 0
            const bSeverity = severityOrder[b.severity] ?? 0
            if (aSeverity !== bSeverity) {
                return bSeverity - aSeverity
            }
            return (
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
        })

        // Ensure type safety for severity
        const typedAlerts: DashboardAlert[] = sortedAlerts
            .slice(0, 10)
            .map(a => ({
                ...a,
                severity:
                    a.severity === "high" ||
                    a.severity === "medium" ||
                    a.severity === "low"
                        ? a.severity
                        : "low",
            }))

        return { success: true, data: typedAlerts } // Return top 10 alerts
    } catch (error) {
        return handleError(error, "Get Dashboard Alerts")
    }
}

/**
 * Get today's schedule for the dashboard
 */
export type DashboardScheduleItem = {
    id: string
    description: string
    timePeriod: string
    count: number
    type: string
}

export async function getTodaysScheduleAction(
    organizationId: string
): Promise<DashboardActionResult<DashboardScheduleItem[]>> {
    if (!organizationId) {
        return { success: false, error: "Organization ID is required." }
    }
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: "Unauthorized" }
        }

        const today = new Date()
        const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        )
        const endOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59
        )

        // Get today's scheduled pickups
        const scheduledPickups = await db.load.count({
            where: {
                organizationId,
                scheduledPickupDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ["assigned", "pending"],
                },
            },
        })

        // Get today's scheduled deliveries
        const scheduledDeliveries = await db.load.count({
            where: {
                organizationId,
                scheduledDeliveryDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ["in_transit", "assigned"],
                },
            },
        })

        // Get vehicles scheduled for maintenance today
        const maintenanceScheduled = await db.vehicle.count({
            where: {
                organizationId,
                nextInspectionDue: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        })

        // Get active loads in transit
        const loadsInTransit = await db.load.count({
            where: {
                organizationId,
                status: "in_transit",
            },
        })

        const scheduleItems = []

        if (scheduledPickups > 0) {
            scheduleItems.push({
                id: "pickups",
                description: `${scheduledPickups} load${
                    scheduledPickups !== 1 ? "s" : ""
                } scheduled for pickup`,
                timePeriod: "Today",
                count: scheduledPickups,
                type: "pickup",
            })
        }

        if (scheduledDeliveries > 0) {
            scheduleItems.push({
                id: "deliveries",
                description: `${scheduledDeliveries} load${
                    scheduledDeliveries !== 1 ? "s" : ""
                } scheduled for delivery`,
                timePeriod: "Today",
                count: scheduledDeliveries,
                type: "delivery",
            })
        }

        if (maintenanceScheduled > 0) {
            scheduleItems.push({
                id: "maintenance",
                description: `${maintenanceScheduled} vehicle${
                    maintenanceScheduled !== 1 ? "s" : ""
                } scheduled for maintenance`,
                timePeriod: "Today",
                count: maintenanceScheduled,
                type: "maintenance",
            })
        }

        if (loadsInTransit > 0) {
            scheduleItems.push({
                id: "in-transit",
                description: `${loadsInTransit} load${
                    loadsInTransit !== 1 ? "s" : ""
                } currently in transit`,
                timePeriod: "Active",
                count: loadsInTransit,
                type: "in_transit",
            })
        }

        // If no scheduled items, provide a default message
        if (scheduleItems.length === 0) {
            scheduleItems.push({
                id: "no-schedule",
                description: "No scheduled activities for today",
                timePeriod: "Today",
                count: 0,
                type: "none",
            })
        }

        return { success: true, data: scheduleItems }
    } catch (error) {
        return handleError(error, "Get Today's Schedule")
    }
}

/**
 * Refresh dashboard data
 */
export async function refreshDashboardAction(): Promise<
    DashboardActionResult<{ message: string }>
> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: "Unauthorized" }
        }

        // Revalidate dashboard-related paths
        revalidatePath("/dashboard")
        revalidatePath("/")

        return { success: true, data: { message: "Dashboard data refreshed" } }
    } catch (error) {
        return handleError(error, "Refresh Dashboard")
    }
}

/**
 * Get dashboard performance metrics
 */
export async function getDashboardPerformanceAction(
    organizationId: string
): Promise<
    DashboardActionResult<{
        onTimeDeliveryRate: number
        fuelEfficiency: number
        utilizationRate: number
        customerSatisfaction: number
    }>
> {
    if (!organizationId) {
        return { success: false, error: "Organization ID is required." }
    }

    try {
        const { userId } = await auth()
        if (!userId) {
            return { success: false, error: "Unauthorized" }
        }

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // Calculate on-time delivery rate
        const totalDeliveries = await db.load.count({
            where: {
                organizationId,
                status: "delivered",
                actualDeliveryDate: { gte: thirtyDaysAgo },
            },
        })

        const onTimeDeliveries = await db.load.count({
            where: {
                organizationId,
                status: "delivered",
                actualDeliveryDate: {
                    gte: thirtyDaysAgo,
                    lte: db.load.fields.scheduledDeliveryDate,
                },
            },
        })

        const onTimeDeliveryRate =
            totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0

        // Mock other metrics for MVP
        const performanceMetrics = {
            onTimeDeliveryRate: Math.round(onTimeDeliveryRate),
            fuelEfficiency: 85, // Mock: miles per gallon average
            utilizationRate: 78, // Mock: vehicle utilization percentage
            customerSatisfaction: 92, // Mock: customer satisfaction score
        }

        return { success: true, data: performanceMetrics }
    } catch (error) {
        return handleError(error, "Get Dashboard Performance")
    }
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(orgId: string, alertId: string) {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const user = await db.user.findFirst({
        where: { clerkId: userId, organizationId: orgId },
    })
    if (!user) throw new Error("User not found or unauthorized")

    // Check if alert belongs to organization
    const alert = await db.complianceAlert.findFirst({
        where: {
            id: alertId,
            organizationId: orgId,
        },
    })
    if (!alert) throw new Error("Alert not found")

    await db.complianceAlert.update({
        where: { id: alertId },
        data: {
            isAcknowledged: true,
            acknowledgedAt: new Date(),
        },
    })

    revalidatePath(`/${orgId}/dashboard`)
    return { success: true }
}

export async function refreshDashboardData(
    orgId: string,
    formData: FormData
): Promise<void> {
    try {
        // Revalidate relevant paths
        revalidatePath(`/${orgId}/dashboard`)
        revalidatePath("/")
    } catch (error) {
        console.error("Error refreshing dashboard:", error)
    }
}
