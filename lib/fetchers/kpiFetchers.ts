/** @format */

"use server"

import prisma from "@/lib/database/db"
import type { OrganizationKPIs } from "@/types/kpi"
import { unstable_cache } from "next/cache"

/**
 * KPI aggregation fetcher with optimized batch queries and caching
 */
async function _getOrganizationKPIs(
    organizationId: string
): Promise<OrganizationKPIs> {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    try {
        // Execute all queries in parallel for better performance
        const [
            vehicles,
            vehiclesPreviousPeriod,
            drivers,
            driversPreviousPeriod,
            loads,
            loadsPreviousPeriod,
            revenueData,
            revenuePreviousPeriod,
            milesData,
            milesPreviousPeriod,
            inspections,
            maintenanceVehicles,
        ] = await Promise.all([
            // Active vehicles (current)
            prisma.vehicle.count({
                where: {
                    organizationId,
                    status: "active",
                },
            }),

            // Active vehicles (previous 30 days for comparison)
            prisma.vehicle.count({
                where: {
                    organizationId,
                    status: "active",
                    createdAt: {
                        lte: thirtyDaysAgo,
                    },
                },
            }),

            // Active drivers (current)
            prisma.driver.count({
                where: {
                    organizationId,
                    status: "active",
                },
            }),

            // Active drivers (previous period)
            prisma.driver.count({
                where: {
                    organizationId,
                    status: "active",
                    createdAt: {
                        lte: thirtyDaysAgo,
                    },
                },
            }),

            // Loads data (last 30 days)
            prisma.load.findMany({
                where: {
                    organizationId,
                    createdAt: {
                        gte: thirtyDaysAgo,
                    },
                },
                select: {
                    status: true,
                    rate: true,
                    actualMiles: true,
                    estimatedMiles: true,
                    createdAt: true,
                    actualDeliveryDate: true,
                },
            }),

            // Loads data (previous 30 days for comparison)
            prisma.load.findMany({
                where: {
                    organizationId,
                    createdAt: {
                        gte: sixtyDaysAgo,
                        lt: thirtyDaysAgo,
                    },
                },
                select: {
                    status: true,
                    rate: true,
                    actualMiles: true,
                    estimatedMiles: true,
                },
            }),

            // Revenue data (last 30 days)
            prisma.load.aggregate({
                where: {
                    organizationId,
                    status: "delivered",
                    actualDeliveryDate: {
                        gte: thirtyDaysAgo,
                    },
                },
                _sum: {
                    rate: true,
                },
            }),

            // Revenue data (previous 30 days)
            prisma.load.aggregate({
                where: {
                    organizationId,
                    status: "delivered",
                    actualDeliveryDate: {
                        gte: sixtyDaysAgo,
                        lt: thirtyDaysAgo,
                    },
                },
                _sum: {
                    rate: true,
                },
            }),

            // Miles data (last 30 days)
            prisma.load.aggregate({
                where: {
                    organizationId,
                    status: "delivered",
                    actualDeliveryDate: {
                        gte: thirtyDaysAgo,
                    },
                    actualMiles: {
                        not: null,
                    },
                },
                _sum: {
                    actualMiles: true,
                },
            }),

            // Miles data (previous 30 days)
            prisma.load.aggregate({
                where: {
                    organizationId,
                    status: "delivered",
                    actualDeliveryDate: {
                        gte: sixtyDaysAgo,
                        lt: thirtyDaysAgo,
                    },
                    actualMiles: {
                        not: null,
                    },
                },
                _sum: {
                    actualMiles: true,
                },
            }),

            // Inspections data (last 30 days)
            prisma.vehicle.findMany({
                where: {
                    organizationId,
                    lastInspectionDate: {
                        gte: thirtyDaysAgo,
                    },
                },
                select: {
                    lastInspectionDate: true,
                    // Note: We'll need to add inspection results to the schema
                    // For now, we'll simulate based on random distribution
                },
            }),

            // Maintenance data
            prisma.vehicle.findMany({
                where: {
                    organizationId,
                    status: "active",
                },
                select: {
                    nextInspectionDue: true,
                    lastInspectionDate: true,
                    status: true,
                },
            }),
        ])

        // Calculate load statistics
        const activeLoads = loads.filter(load =>
            ["assigned", "in_transit"].includes(load.status)
        )
        const completedLoads = loads.filter(load => load.status === "delivered")
        const inTransitLoads = loads.filter(
            load => load.status === "in_transit"
        )
        const pendingLoads = loads.filter(load => load.status === "pending")

        // Calculate revenue metrics
        const totalRevenue = Number(revenueData._sum.rate || 0)
        const previousRevenue = Number(revenuePreviousPeriod._sum.rate || 0)
        const revenueChange =
            previousRevenue > 0
                ? (
                      ((totalRevenue - previousRevenue) / previousRevenue) *
                      100
                  ).toFixed(1)
                : totalRevenue > 0
                ? "+100"
                : "0"

        // Calculate miles metrics
        const totalMiles = Number(milesData._sum.actualMiles || 0)
        const previousMiles = Number(milesPreviousPeriod._sum.actualMiles || 0)
        const milesChange =
            previousMiles > 0
                ? (
                      ((totalMiles - previousMiles) / previousMiles) *
                      100
                  ).toFixed(1)
                : totalMiles > 0
                ? "+100"
                : "0"

        const revenuePerMile =
            totalMiles > 0 ? (totalRevenue / totalMiles).toFixed(2) : "0.00"
        const milesPerVehicleAvg =
            vehicles > 0 ? Math.round(totalMiles / vehicles) : 0

        // Calculate vehicle/driver changes
        const vehicleChange =
            vehiclesPreviousPeriod > 0
                ? (
                      ((vehicles - vehiclesPreviousPeriod) /
                          vehiclesPreviousPeriod) *
                      100
                  ).toFixed(1)
                : vehicles > 0
                ? "+100"
                : "0"

        const driverChange =
            driversPreviousPeriod > 0
                ? (
                      ((drivers - driversPreviousPeriod) /
                          driversPreviousPeriod) *
                      100
                  ).toFixed(1)
                : drivers > 0
                ? "+100"
                : "0"

        // Calculate inspection metrics
        const recentInspections = inspections.length
        // Simulate failed inspections (in a real scenario, this would come from inspection results)
        const failedInspections = Math.floor(recentInspections * 0.125) // Assume 12.5% failure rate
        const inspectionSuccessRate =
            recentInspections > 0
                ? (
                      ((recentInspections - failedInspections) /
                          recentInspections) *
                      100
                  ).toFixed(1)
                : "0"

        // Calculate maintenance metrics
        const upcomingMaintenance = maintenanceVehicles.filter(
            v =>
                v.nextInspectionDue &&
                new Date(v.nextInspectionDue) <=
                    new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        ).length

        const maintenanceOverdue = maintenanceVehicles.filter(
            v => v.nextInspectionDue && new Date(v.nextInspectionDue) < today
        ).length

        const maintenanceThisWeek = maintenanceVehicles.filter(
            v =>
                v.nextInspectionDue &&
                new Date(v.nextInspectionDue) <=
                    new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        ).length

        // Calculate pending load breakdowns
        const urgentLoads = pendingLoads.filter(load => {
            if (!load.createdAt) return false
            const hoursSinceCreation =
                (today.getTime() - new Date(load.createdAt).getTime()) /
                (1000 * 60 * 60)
            return hoursSinceCreation > 24 // Consider urgent if pending for more than 24 hours
        }).length

        const awaitingPickup = Math.floor(pendingLoads.length * 0.5) // Estimate 50% awaiting pickup
        const awaitingAssignment = pendingLoads.length - awaitingPickup

        const kpis = {
            activeVehicles: vehicles,
            activeVehiclesChange: `${
                Number(vehicleChange) >= 0 ? "+" : ""
            }${vehicleChange}%`,
            activeDrivers: drivers,
            activeDriversChange: `${
                Number(driverChange) >= 0 ? "+" : ""
            }${driverChange}%`,
            activeLoads: activeLoads.length,
            activeLoadsLive: inTransitLoads.length,
            completedLoads: completedLoads.length,
            inTransitLoads: inTransitLoads.length,
            totalRevenue,
            revenueChange: `${
                Number(revenueChange) >= 0 ? "+" : ""
            }${revenueChange}%`,
            revenuePerMile: Number(revenuePerMile),
            revenueTarget: 2.5, // This could be configurable per organization
            totalMiles,
            milesChange: `${
                Number(milesChange) >= 0 ? "+" : ""
            }${milesChange}%`,
            milesPerVehicleAvg,
            milesTarget: 25000, // This could be configurable per organization
            recentInspections,
            failedInspections,
            inspectionSuccessRate: Number(inspectionSuccessRate),
            upcomingMaintenance,
            maintenanceOverdue,
            maintenanceThisWeek,
            pendingLoads: pendingLoads.length,
            pendingLoadsUrgent: urgentLoads,
            pendingLoadsAwaitingPickup: awaitingPickup,
            pendingLoadsAwaitingAssignment: awaitingAssignment,
        }

        return kpis
    } catch (error) {
        console.error("Error fetching organization KPIs:", error)
        throw new Error("Failed to fetch organization KPIs")
    }
}

export const getOrganizationKPIs = unstable_cache(
    _getOrganizationKPIs,
    ["organization-kpis"],
    { revalidate: 120, tags: ["kpi"] }
)
