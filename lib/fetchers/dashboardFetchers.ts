/** @format */

"use server"

import db from "@/lib/database/db"
import type {
    ActivityItem,
    DashboardData,
    DashboardKPI,
    DashboardMetrics,
    QuickAction,
} from "@/types/dashboard"
import { auth } from "@clerk/nextjs/server"
import { unstable_cache } from "next/cache"

export const getDashboardMetrics = unstable_cache(
    async (orgId: string, userId: string): Promise<DashboardMetrics> => {
        const user = await db.user.findFirst({
            where: { clerkId: userId, organizationId: orgId },
        })
        if (!user) throw new Error("User not found or unauthorized")

        const [
            totalLoads,
            activeLoads,
            totalDrivers,
            activeDrivers,
            totalVehicles,
            availableVehicles,
            maintenanceVehicles,
            alertsCount,
        ] = await Promise.all([
            db.load.count({ where: { organizationId: orgId } }),
            db.load.count({
                where: {
                    organizationId: orgId,
                    status: {
                        in: [
                            "assigned",
                            "in_transit",
                            "at_pickup",
                            "at_delivery",
                        ],
                    },
                },
            }),
            db.driver.count({ where: { organizationId: orgId } }),
            db.driver.count({
                where: {
                    organizationId: orgId,
                    status: "active",
                },
            }),
            db.vehicle.count({ where: { organizationId: orgId } }),
            db.vehicle.count({
                where: {
                    organizationId: orgId,
                    status: "active",
                },
            }),
            db.vehicle.count({
                where: {
                    organizationId: orgId,
                    status: "maintenance",
                },
            }),
            db.complianceAlert.count({
                where: {
                    organizationId: orgId,
                    resolved: false,
                },
            }),
        ])

        return {
            activeLoads,
            totalLoads,
            activeDrivers,
            totalDrivers,
            availableVehicles,
            totalVehicles,
            maintenanceVehicles,
            criticalAlerts: alertsCount,
            complianceScore: 85, // TODO: Calculate based on compliance metrics
            revenue: 0, // TODO: Calculate from completed loads
            fuelCosts: 0, // TODO: Calculate from expense records
        }
    },
    ["dashboard-metrics"],
    {
        revalidate: 300, // 5 minutes
        tags: ["dashboard"],
    }
)

export const getDashboardKPIs = async (
    orgId: string,
    userId: string,
    metrics: DashboardMetrics
): Promise<DashboardKPI[]> => {
    const user = await db.user.findFirst({
        where: { clerkId: userId, organizationId: orgId },
        select: { role: true },
    })
    if (!user) throw new Error("Unauthorized")

    const utilizationRate =
        metrics.totalVehicles > 0
            ? Math.round(
                  ((metrics.totalVehicles - metrics.availableVehicles) /
                      metrics.totalVehicles) *
                      100
              )
            : 0

    const kpis: DashboardKPI[] = [
        {
            title: "Active Loads",
            value: metrics.activeLoads,
            icon: "Truck",
            color: "blue",
            trend: "up",
            change: 12,
        },
        {
            title: "Available Drivers",
            value: metrics.activeDrivers,
            icon: "Users",
            color: "green",
            trend: "neutral",
        },
        {
            title: "Fleet Utilization",
            value: `${utilizationRate}%`,
            icon: "Activity",
            color: "purple",
            trend: "up",
            change: 5,
        },
        {
            title: "Active Alerts",
            value: metrics.criticalAlerts,
            icon: "AlertTriangle",
            color: metrics.criticalAlerts > 0 ? "red" : "green",
        },
    ]

    return kpis
}

export const getQuickActions = async (
    orgId: string,
    userId: string
): Promise<QuickAction[]> => {
    const user = await db.user.findFirst({
        where: { clerkId: userId, organizationId: orgId },
        select: { role: true },
    })
    if (!user) throw new Error("Unauthorized")

    const actions: QuickAction[] = [
        {
            title: "Create Load",
            description: "Add a new load to the system",
            href: `/${orgId}/loads/new`,
            icon: "Plus",
            color: "bg-blue-500",
            permission: ["admin", "dispatcher"],
        },
        {
            title: "Assign Driver",
            description: "Assign drivers to available loads",
            href: `/${orgId}/loads?assign=true`,
            icon: "UserPlus",
            color: "bg-green-500",
            permission: ["admin", "dispatcher"],
        },
        {
            title: "View Alerts",
            description: "Check compliance and safety alerts",
            href: `/${orgId}/compliance/alerts`,
            icon: "AlertCircle",
            color: "bg-red-500",
            permission: ["admin", "compliance_officer"],
        },
        {
            title: "Fleet Status",
            description: "View vehicle and driver status",
            href: `/${orgId}/fleet`,
            icon: "Truck",
            color: "bg-purple-500",
            permission: [
                "admin",
                "dispatcher",
                "driver",
                "compliance_officer",
                "accountant",
                "viewer",
            ],
        },
        {
            title: "Reports",
            description: "Generate operational reports",
            href: `/${orgId}/reports`,
            icon: "BarChart3",
            color: "bg-orange-500",
            permission: [
                "admin",
                "dispatcher",
                "compliance_officer",
                "accountant",
            ],
        },
    ]

    return actions.filter(action => action.permission.includes(user.role))
}

export const getRecentActivity = unstable_cache(
    async (orgId: string, userId: string): Promise<ActivityItem[]> => {
        const user = await db.user.findFirst({
            where: { clerkId: userId, organizationId: orgId },
        })
        if (!user) throw new Error("Unauthorized")

        const auditLogs = await db.auditLog.findMany({
            where: { organizationId: orgId },
            orderBy: { timestamp: "desc" },
            take: 10,
        })

        return auditLogs.map(log => ({
            id: log.id,
            type: log.entityType as ActivityItem["type"],
            title: log.action,
            description: `${log.action} on ${log.entityType}`,
            timestamp: log.timestamp,
            userId: log.userId || undefined,
            userName: "User",
            severity: "info" as const,
        }))
    },
    ["dashboard-activity"],
    {
        revalidate: 60, // 1 minute
        tags: ["dashboard", "activity"],
    }
)

export const getDashboardData = async (
    orgId: string
): Promise<DashboardData> => {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const [metrics, recentActivity] = await Promise.all([
        getDashboardMetrics(orgId, userId),
        getRecentActivity(orgId, userId),
    ])

    const [kpis, quickActions] = await Promise.all([
        getDashboardKPIs(orgId, userId, metrics),
        getQuickActions(orgId, userId),
    ])

    // Get alerts (simplified for MVP)
    const alerts = await db.complianceAlert.findMany({
        where: {
            organizationId: orgId,
            resolved: false,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    })

    return {
        metrics,
        kpis,
        quickActions,
        recentActivity,
        alerts: alerts.map(alert => ({
            id: alert.id,
            type: "document_missing" as const,
            title: `Alert ${alert.id}`,
            description: alert.message || "Compliance alert",
            severity: "medium" as const,
            entityId: alert.driverId || alert.vehicleId || "",
            entityType: alert.driverId
                ? ("driver" as const)
                : ("vehicle" as const),
            createdAt: alert.createdAt,
        })),
    }
}
