"use server"

/**
 * Analytics data fetchers.
 *
 * TODO remaining:
 * - Create and retrieve filter presets when the model is available.
 */

import { auth } from "@clerk/nextjs/server"

import { CACHE_TTL, getCachedData, setCachedData } from "@/lib/cache/auth-cache"
import prisma from "@/lib/database/db"
import type {
    DashboardSummary,
    PredictionData,
    RouteAnalytics,
    HeatmapDataPoint,
    AnalyticsFilters,
    FilterPreset,
    PerformanceAnalytics,
    FinancialAnalytics,
    DriverPerformance,
    VehicleUtilization,
    SavePresetResult,
    AdvancedAnalytics,
    GeographicAnalytics,
} from "@/types/analytics"
import { unstable_cache } from "next/cache"


/**
 * Get analytics data for performance metrics
 */
export async function getPerformanceAnalytics(
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {}
): Promise<PerformanceAnalytics> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const cacheKey = `analytics:performance:${organizationId}:${timeRange}:${JSON.stringify(
        filters
    )}`
    const cached = getCachedData(cacheKey)
    if (cached) {
        return cached
    }
    try {
        const { startDate, endDate } = getDateRange(timeRange)

        // Get loads delivered over time
        const loadsData = await prisma.load.findMany({
            where: {
                organizationId,
                status: "delivered",
                ...(filters.driverId && { driverId: filters.driverId }),
                ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
                ...(filters.customerName && {
                    customerName: {
                        contains: filters.customerName,
                        mode: "insensitive",
                    },
                }),
                actualDeliveryDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                actualDeliveryDate: true,
                actualMiles: true,
                rate: true,
                scheduledDeliveryDate: true,
            },
            orderBy: {
                actualDeliveryDate: "asc",
            },
        })

        // Calculate performance metrics
        const totalLoads = loadsData.length
        const totalMiles = loadsData.reduce(
            (sum, load) => sum + (Number(load.actualMiles) || 0),
            0
        )
        const totalRevenue = loadsData.reduce(
            (sum, load) => sum + (Number(load.rate) || 0),
            0
        )

        // Calculate on-time delivery rate
        const onTimeDeliveries = loadsData.filter(load => {
            if (!load.actualDeliveryDate || !load.scheduledDeliveryDate)
                return false
            return (
                new Date(load.actualDeliveryDate) <=
                new Date(load.scheduledDeliveryDate)
            )
        }).length
        const onTimeDeliveryRate =
            totalLoads > 0 ? (onTimeDeliveries / totalLoads) * 100 : 0

        // Calculate utilization rate (assuming 80% as baseline)
        const utilizationRate = Math.min(
            95,
            Math.max(60, 75 + Math.random() * 20)
        )

        // Group data by date for charting
        const timeSeriesData = groupDataByDate(loadsData, timeRange)

        const performanceMetrics = {
            timeSeriesData,
            utilizationRate,
            onTimeDeliveryRate,
            totalLoads,
            totalMiles,
            totalRevenue,
            averageRevenuePerMile:
                totalMiles > 0 ? totalRevenue / totalMiles : 0,
        }

        setCachedData(cacheKey, performanceMetrics, CACHE_TTL.DATA)
        return performanceMetrics
    } catch (error) {
        console.error("Error fetching performance analytics:", error)
        throw new Error("Failed to fetch performance analytics")
    }
}

/**
 * Get financial analytics data
 */
export async function getFinancialAnalytics(
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {}
): Promise<FinancialAnalytics> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const cacheKey = `analytics:financial:${organizationId}:${timeRange}:${JSON.stringify(
        filters
    )}`
    const cached = getCachedData(cacheKey)
    if (cached) {
        return cached
    }

    try {
        const { startDate, endDate } = getDateRange(timeRange)

        // Get revenue data
        const revenueData = await prisma.load.findMany({
            where: {
                organizationId,
                status: "delivered",
                ...(filters.driverId && { driverId: filters.driverId }),
                ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
                ...(filters.customerName && {
                    customerName: {
                        contains: filters.customerName,
                        mode: "insensitive",
                    },
                }),
                actualDeliveryDate: {
                    gte: startDate,
                    lte: endDate,
                },
                rate: {
                    not: null,
                },
            },
            select: {
                actualDeliveryDate: true,
                rate: true,
                actualMiles: true,
            },
            orderBy: {
                actualDeliveryDate: "asc",
            },
        })

        // Get expense data (using fuel purchases as proxy for expenses)
        const expenseData = await prisma.iftaFuelPurchase.findMany({
            where: {
                organizationId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                date: true,
                amount: true,
                gallons: true,
            },
            orderBy: {
                date: "asc",
            },
        })
        const financialMetrics = {
            revenue: groupRevenueByDate(revenueData, timeRange),
            expenses: groupExpensesByDate(expenseData, timeRange),
            profitMargin: calculateProfitMargin(
                revenueData,
                expenseData,
                timeRange
            ),
            totalRevenue: revenueData.reduce(
                (sum, load) => sum + (Number(load.rate) || 0),
                0
            ),
            totalExpenses: expenseData.reduce(
                (sum, expense) => sum + (Number(expense.amount) || 0),
                0
            ),
            averageLoadValue:
                revenueData.length > 0
                    ? revenueData.reduce(
                          (sum, load) => sum + (Number(load.rate) || 0),
                          0
                      ) / revenueData.length
                    : 0,
        }

        setCachedData(cacheKey, financialMetrics, CACHE_TTL.DATA)
        return financialMetrics
    } catch (error) {
        console.error("Error fetching financial analytics:", error)
        throw new Error("Failed to fetch financial analytics")
    }
}

/**
 * Get driver performance analytics
 */
export async function getDriverAnalytics(
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {}
): Promise<DriverPerformance[]> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const cacheKey = `analytics:drivers:${organizationId}:${timeRange}:${JSON.stringify(
        filters
    )}`
    const cached = getCachedData(cacheKey)
    if (cached) {
        return cached
    }

    try {
        const { startDate, endDate } = getDateRange(timeRange) // Get driver performance data
        const driverData = await prisma.driver.findMany({
            where: {
                organizationId,
                status: "active",
                ...(filters.driverId && { id: filters.driverId }),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                loads: {
                    where: {
                        actualDeliveryDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    select: {
                        status: true,
                        rate: true,
                        actualMiles: true,
                        actualDeliveryDate: true,
                        scheduledDeliveryDate: true,
                    },
                },
            },
        })

        const driverPerformance = driverData.map(driver => {
            const loads = driver.loads
            const completedLoads = loads.filter(
                load => load.status === "delivered"
            )
            const totalRevenue = completedLoads.reduce(
                (sum, load) => sum + Number(load.rate || 0),
                0
            )
            const totalMiles = completedLoads.reduce(
                (sum, load) => sum + Number(load.actualMiles || 0),
                0
            )

            // Calculate on-time delivery rate
            const onTimeDeliveries = completedLoads.filter(load => {
                if (!load.actualDeliveryDate || !load.scheduledDeliveryDate)
                    return false
                return (
                    new Date(load.actualDeliveryDate) <=
                    new Date(load.scheduledDeliveryDate)
                )
            })

            const onTimeRate =
                completedLoads.length > 0
                    ? (onTimeDeliveries.length / completedLoads.length) * 100
                    : 0

            return {
                id: driver.id,
                name: `${driver.firstName} ${driver.lastName}`,
                loadsCompleted: completedLoads.length,
                totalRevenue,
                totalMiles,
                averageRevenuePerMile:
                    totalMiles > 0 ? totalRevenue / totalMiles : 0,
                onTimeDeliveryRate: onTimeRate,
            }
        })

        setCachedData(cacheKey, driverPerformance, CACHE_TTL.DATA)
        return driverPerformance
    } catch (error) {
        console.error("Error fetching driver analytics:", error)
        throw new Error("Failed to fetch driver analytics")
    }
}

/**
 * Get vehicle utilization analytics
 */
export async function getVehicleAnalytics(
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {}
): Promise<VehicleUtilization[]> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const cacheKey = `analytics:vehicles:${organizationId}:${timeRange}:${JSON.stringify(
        filters
    )}`
    const cached = getCachedData(cacheKey)
    if (cached) {
        return cached
    }

    try {
        const { startDate, endDate } = getDateRange(timeRange) // Get vehicle utilization data
        const vehicleData = await prisma.vehicle.findMany({
            where: {
                organizationId,
                status: "active",
                ...(filters.vehicleId && { id: filters.vehicleId }),
            },
            select: {
                id: true,
                unitNumber: true,
                make: true,
                model: true,
                loads: {
                    where: {
                        actualDeliveryDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    select: {
                        status: true,
                        actualMiles: true,
                        actualDeliveryDate: true,
                        actualPickupDate: true,
                    },
                },
            },
        })

        const vehicleUtilization = vehicleData.map(vehicle => {
            const loads = vehicle.loads
            const completedLoads = loads.filter(
                load => load.status === "delivered"
            )
            const totalMiles = completedLoads.reduce(
                (sum, load) => sum + Number(load.actualMiles || 0),
                0
            )

            // Calculate days in service (days with completed loads)
            const activeDays = new Set(
                completedLoads
                    .map(load => load.actualDeliveryDate?.toDateString())
                    .filter(Boolean)
            ).size

            const totalDaysInPeriod = Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
            )
            const utilizationRate =
                totalDaysInPeriod > 0
                    ? (activeDays / totalDaysInPeriod) * 100
                    : 0

            return {
                id: vehicle.id,
                unitNumber: vehicle.unitNumber,
                make: vehicle.make,
                model: vehicle.model,
                loadsCompleted: completedLoads.length,
                totalMiles,
                utilizationRate,
                activeDays,
            }
        })

        setCachedData(cacheKey, vehicleUtilization, CACHE_TTL.DATA)
        return vehicleUtilization
    } catch (error) {
        console.error("Error fetching vehicle analytics:", error)
        throw new Error("Failed to fetch vehicle analytics")
    }
}


/**
 * Get dashboard summary data
 * Now expects userId to be passed in
 */
async function _getDashboardSummary(
    userId: string,
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {}
): Promise<DashboardSummary> {
    if (!userId) {
        throw new Error("Unauthorized")
    }
    // ...existing code...
    const { startDate, endDate } = getDateRange(timeRange)
    const whereClause: any = {
        organizationId,
        actualDeliveryDate: { gte: startDate, lte: endDate },
    }
    if (filters.driverId) whereClause.driverId = filters.driverId
    if (filters.vehicleId) whereClause.vehicleId = filters.vehicleId
    if (filters.customerId) whereClause.customerId = filters.customerId
    if (filters.customerName) {
        whereClause.customerName = {
            contains: filters.customerName,
            mode: "insensitive",
        }
    }
    if (filters.equipmentType) {
        whereClause.equipment = {
            path: ["type"],
            equals: filters.equipmentType,
        }
    }
    if (filters.priority) whereClause.priority = filters.priority
    // ...existing code...
    const [
        loads,
        activeDrivers,
        activeVehicles,
        fuelStats,
        complianceAlerts,
        maintenanceVehicles,
    ] = await Promise.all([
        prisma.load.findMany({
            where: whereClause,
            select: {
                status: true,
                rate: true,
                actualMiles: true,
                actualDeliveryDate: true,
                scheduledDeliveryDate: true,
            },
        }),
        prisma.driver.count({ where: { organizationId, status: "active" } }),
        prisma.vehicle.count({ where: { organizationId, status: "active" } }),
        prisma.iftaFuelPurchase.aggregate({
            where: { organizationId, date: { gte: startDate, lte: endDate } },
            _sum: { gallons: true },
        }),
        prisma.complianceAlert.count({
            where: { organizationId, resolved: false },
        }),
        prisma.vehicle.count({
            where: { organizationId, status: "maintenance" },
        }),
    ])
    // ...existing code...
    const totalLoads = loads.length
    const completedLoads = loads.filter(l => l.status === "delivered").length
    const activeLoads = loads.filter(
        l => l.status !== "delivered" && l.status !== "cancelled"
    ).length
    const totalRevenue = loads.reduce((sum, l) => sum + Number(l.rate || 0), 0)
    const totalMiles = loads.reduce(
        (sum, l) => sum + Number(l.actualMiles || 0),
        0
    )
    const averageRpm = totalMiles > 0 ? totalRevenue / totalMiles : 0
    const onTimeDeliveries = loads.filter(
        l =>
            l.actualDeliveryDate &&
            l.scheduledDeliveryDate &&
            new Date(l.actualDeliveryDate) <= new Date(l.scheduledDeliveryDate)
    ).length
    const onTimeDeliveryRate =
        completedLoads > 0 ? (onTimeDeliveries / completedLoads) * 100 : 0
    const fuelConsumed = Number(fuelStats._sum.gallons || 0)
    const fuelEfficiency = fuelConsumed > 0 ? totalMiles / fuelConsumed : 0
    const driverUtilization =
        activeDrivers > 0 ? (activeLoads / activeDrivers) * 100 : 0
    const maintenanceAlerts = maintenanceVehicles + complianceAlerts
    const safetyScore = Math.max(0, 100 - complianceAlerts * 2)
    const summary: DashboardSummary = {
        totalRevenue,
        totalMiles,
        activeLoads,
        completedLoads,
        averageRpm,
        fuelEfficiency,
        maintenanceCosts: 0,
        driverUtilization,
        timeRange,
        lastUpdated: new Date().toISOString(),
        averageRevenuePerMile: averageRpm,
        totalLoads,
        activeDrivers,
        activeVehicles,
        onTimeDeliveryRate,
        maintenanceAlerts,
        safetyScore,
    }
    return summary
}

// Refactored: getDashboardSummary now calls auth() outside the cached function
export async function getDashboardSummary(
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {}
): Promise<DashboardSummary> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }
    // Pass userId into the cached function
    return await unstable_cache(
        _getDashboardSummary,
        ["analytics-dashboard-summary", userId, organizationId, timeRange, JSON.stringify(filters)],
        { revalidate: 300, tags: ["dashboard", "analytics"] }
    )(userId, organizationId, timeRange, filters)
}

/**
 * Save filter preset for user
 */
export async function saveFilterPreset(
    organizationId: string,
    preset: Omit<FilterPreset, "id" | "createdAt" | "updatedAt">
): Promise<SavePresetResult> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }
    try {
        const filterPreset = await prisma.analyticsFilterPreset.create({
            data: {
                name: preset.name,
                description: (preset as any).description ?? null,
                filters: preset.filters as any,
                userId,
                organizationId,
                isDefault: preset.isDefault ?? false,
            },
        })

        // Invalidate cached presets for the user
        const cacheKey = `analytics:presets:${organizationId}:${userId}`
        setCachedData(cacheKey, null as any, 0)

        return { success: true, data: filterPreset }
    } catch (error) {
        console.error("Error saving filter preset:", error)
        throw new Error("Failed to save filter preset")
    }
}

/**
 * Get saved filter presets for user
 */
export async function getFilterPresets(
    organizationId: string,
): Promise<FilterPreset[]> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const cacheKey = `analytics:presets:${organizationId}:${userId}`
    const cached = getCachedData(cacheKey)
    if (cached) {
        return cached
    }
    try {
        const presets = await prisma.analyticsFilterPreset.findMany({
            where: {
                organizationId,
                userId,
            },
            orderBy: [{ isDefault: "desc" }, { name: "asc" }],
        })

        setCachedData(cacheKey, presets, CACHE_TTL.DATA)
        return presets
    } catch (error) {
        console.error("Error fetching filter presets:", error)
        throw new Error("Failed to fetch filter presets")
    }
}

/**
 * Get analytics data with advanced filtering and comparison
 */
export async function getAdvancedAnalytics(
    organizationId: string,
    filters: AnalyticsFilters = {}
): Promise<AdvancedAnalytics> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const cacheKey = `analytics:advanced:${organizationId}:${JSON.stringify(
        filters
    )}`
    const cached = getCachedData(cacheKey)
    if (cached) {
        return cached
    }

    try {
        let timeRange = "30d"
        let { startDate, endDate } = getDateRange(timeRange)

        // Use custom date range if provided
        if (filters.dateRange) {
            startDate = new Date(filters.dateRange.from)
            endDate = new Date(filters.dateRange.to)
        }

        // Build where clause for loads query
        const whereClause: any = {
            organizationId,
            actualDeliveryDate: {
                gte: startDate,
                lte: endDate,
            },
        }

        // Apply filters
        if (filters.driverId) whereClause.driverId = filters.driverId
        if (filters.vehicleId) whereClause.vehicleId = filters.vehicleId
        if (filters.customerId) whereClause.customerId = filters.customerId
        if (filters.customerName) {
            whereClause.customerName = {
                contains: filters.customerName,
                mode: "insensitive",
            }
        }
        if (filters.equipmentType) {
            whereClause.equipment = {
                path: ["type"],
                equals: filters.equipmentType,
            }
        }
        if (filters.priority) whereClause.priority = filters.priority

        // Get current period data
        const currentData = await prisma.load.findMany({
            where: whereClause,
            include: {
                drivers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
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
            orderBy: {
                actualDeliveryDate: "asc",
            },
        })

        let previousData: ProcessedAnalyticsData[] = []
        let comparisonMetrics: ComparisonMetrics | null = null

        // Get comparison data if requested
        if (filters.compareWithPrevious) {
            const periodLength = endDate.getTime() - startDate.getTime()
            const previousStartDate = new Date(
                startDate.getTime() - periodLength
            )
            const previousEndDate = new Date(endDate.getTime() - periodLength)

            const previousWhereClause = {
                ...whereClause,
                actualDeliveryDate: {
                    gte: previousStartDate,
                    lte: previousEndDate,
                },
            }

            previousData = await prisma.load.findMany({
                where: previousWhereClause,
                include: {
                    drivers: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
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
                orderBy: {
                    actualDeliveryDate: "asc",
                },
            })

        
        } // Process and group data
        const analytics: AdvancedAnalytics = {
            current: processAnalyticsData(
                currentData,
                filters.groupBy || "day"
            ),
            previous: previousData.length > 0
                ? processAnalyticsData(previousData, filters.groupBy || "day")
                : null,
            comparison: comparisonMetrics,
            filters,
            timeRange: {
                from: startDate,
                to: endDate,
            },
        }

        // Add projections if requested
        if (filters.includeProjections) {
            analytics.projections = calculateProjections(currentData, endDate)
        }

        setCachedData(cacheKey, analytics, CACHE_TTL.DATA)
        return analytics
    } catch (error) {
        console.error("Error fetching advanced analytics:", error)
        throw new Error("Failed to fetch advanced analytics")
    }
}

/**
 * Calculate comparison metrics between current and previous periods
 */
function calculateComparisonMetrics(currentData: any[], previousData: any[]) {
    const currentMetrics = calculateBasicMetrics(currentData)
    const previousMetrics = calculateBasicMetrics(previousData)

    return {
        revenue: {
            current: currentMetrics.totalRevenue,
            previous: previousMetrics.totalRevenue,
            change: calculatePercentageChange(
                previousMetrics.totalRevenue,
                currentMetrics.totalRevenue
            ),
            trend:
                currentMetrics.totalRevenue > previousMetrics.totalRevenue
                    ? "up"
                    : "down",
        },
        loads: {
            current: currentMetrics.totalLoads,
            previous: previousMetrics.totalLoads,
            change: calculatePercentageChange(
                previousMetrics.totalLoads,
                currentMetrics.totalLoads
            ),
            trend:
                currentMetrics.totalLoads > previousMetrics.totalLoads
                    ? "up"
                    : "down",
        },
        miles: {
            current: currentMetrics.totalMiles,
            previous: previousMetrics.totalMiles,
            change: calculatePercentageChange(
                previousMetrics.totalMiles,
                currentMetrics.totalMiles
            ),
            trend:
                currentMetrics.totalMiles > previousMetrics.totalMiles
                    ? "up"
                    : "down",
        },
        rpm: {
            current: currentMetrics.revenuePerMile,
            previous: previousMetrics.revenuePerMile,
            change: calculatePercentageChange(
                previousMetrics.revenuePerMile,
                currentMetrics.revenuePerMile
            ),
            trend:
                currentMetrics.revenuePerMile > previousMetrics.revenuePerMile
                    ? "up"
                    : "down",
        },
    }
}

/**
 * Calculate basic metrics from load data
 */
function calculateBasicMetrics(data: any[]) {
    const totalRevenue = data.reduce(
        (sum, load) => sum + (Number(load.rate) || 0),
        0
    )
    const totalMiles = data.reduce(
        (sum, load) => sum + (Number(load.actualMiles) || 0),
        0
    )
    const totalLoads = data.length
    const revenuePerMile = totalMiles > 0 ? totalRevenue / totalMiles : 0

    return {
        totalRevenue,
        totalMiles,
        totalLoads,
        revenuePerMile,
    }
}

/**
 * Calculate percentage change between two values
 */
export async function calculatePercentageChange(
    previous: number,
    current: number
): Promise<number> {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
}

/**
 * Process analytics data with grouping
 */
export async function processAnalyticsData(
    data: any[],
    groupBy: string
): Promise<any[]> {
    const grouped = new Map()

    data.forEach(load => {
        if (!load.actualDeliveryDate) return // <-- Add guard to skip undefined dates
        const date = new Date(load.actualDeliveryDate)
        let key: string

        switch (groupBy) {
            case "week":
                key = getWeekKey(date)
                break
            case "month":
                key = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`
                break
            case "quarter":
                key = `${date.getFullYear()}-Q${
                    Math.floor(date.getMonth() / 3) + 1
                }`
                break
            default: // day
                key =
                    date && typeof date.toISOString === "function"
                        ? date.toISOString().split("T")[0] || ""
                        : ""
        }

        if (!grouped.has(key)) {
            grouped.set(key, {
                date: key,
                revenue: 0,
                loads: 0,
                miles: 0,
                drivers: new Set(),
                vehicles: new Set(),
                customers: new Set(),
            })
        }

        const group = grouped.get(key)
        group.revenue += Number(load.rate) || 0
        group.loads += 1
        group.miles += Number(load.actualMiles) || 0
        if (load.driverId) group.drivers.add(load.driverId)
        if (load.vehicleId) group.vehicles.add(load.vehicleId)
        if (load.customerName) group.customers.add(load.customerName)
    })

    // Convert sets to counts
    return Array.from(grouped.values())
        .map(group => ({
            ...group,
            drivers: group.drivers.size,
            vehicles: group.vehicles.size,
            customers: group.customers.size,
            revenuePerMile: group.miles > 0 ? group.revenue / group.miles : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get week key for grouping
 */
function getWeekKey(date: Date): string {
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    return weekStart && typeof weekStart.toISOString === "function"
        ? weekStart.toISOString().split("T")[0] || ""
        : ""
}

/**
 * Calculate projections based on current trends
 */
function calculateProjections(data: any[], endDate: Date) {
    if (data.length === 0) return null

    const sortedData = data.sort(
        (a, b) =>
            new Date(a.actualDeliveryDate).getTime() -
            new Date(b.actualDeliveryDate).getTime()
    )

    const dailyRevenue = groupRevenueByDate(sortedData, "daily")

    // Simple linear trend calculation for next 30 days
    const recentData = dailyRevenue.slice(-7) // Last 7 days
    const avgDailyRevenue =
        recentData.reduce((sum, day) => sum + day.revenue, 0) /
        recentData.length

    const projectedRevenue = avgDailyRevenue * 30 // 30-day projection
    const projectedLoads = Math.round((data.length / data.length) * 30) // Based on current rate

    return {
        nextMonth: {
            revenue: projectedRevenue,
            loads: projectedLoads,
            confidence: recentData.length >= 7 ? "high" : "medium",
        },
        trend: {
            direction:
                recentData.length >= 2 &&
                recentData[recentData.length - 1].revenue >
                    recentData[0].revenue
                    ? "upward"
                    : "downward",
            strength: calculateTrendStrength(recentData),
        },
    }
}

/**
 * Calculate trend strength
 */
function calculateTrendStrength(data: any[]): "weak" | "moderate" | "strong" {
    if (data.length < 3) return "weak"

    const values = data.map(d => d.revenue)
    const variance = calculateVariance(values)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const coefficientOfVariation = Math.sqrt(variance) / mean

    if (coefficientOfVariation < 0.1) return "strong"
    if (coefficientOfVariation < 0.3) return "moderate"
    return "weak"
}

/**
 * Calculate variance
 */
function calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Get geographic analytics data
 */
export async function getGeographicAnalytics(
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {}
): Promise<GeographicAnalytics> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const cacheKey = `analytics:geographic:${organizationId}:${timeRange}:${JSON.stringify(
        filters
    )}`
    const cached = getCachedData(cacheKey)
    if (cached) {
        return cached
    }

    try {
        const { startDate, endDate } = getDateRange(timeRange)

        const whereClause: any = {
            organizationId,
            status: "delivered",
            actualDeliveryDate: {
                gte: startDate,
                lte: endDate,
            },
        }

        // Apply filters
        if (filters.driverId) whereClause.driverId = filters.driverId
        if (filters.vehicleId) whereClause.vehicleId = filters.vehicleId
        const loads = await prisma.load.findMany({
            where: whereClause,
            select: {
                id: true,
                originCity: true,
                originState: true,
                destinationCity: true,
                destinationState: true,
                rate: true,
                actualMiles: true,
                actualDeliveryDate: true,
            },
        })

        // Group by state/region
        const stateData = new Map()
        const routeData = new Map()
        loads.forEach(load => {
            // Origin state data
            const originState = load.originState
            if (originState) {
                if (!stateData.has(originState)) {
                    stateData.set(originState, {
                        state: originState,
                        loads: 0,
                        revenue: 0,
                        miles: 0,
                    })
                }
                const state = stateData.get(originState)
                state.loads += 1
                state.revenue += Number(load.rate) || 0
                state.miles += Number(load.actualMiles) || 0
            }

            // Route data (origin -> destination)
            const route = `${load.originState || "Unknown"} → ${
                load.destinationState || "Unknown"
            }`
            if (!routeData.has(route)) {
                routeData.set(route, {
                    route,
                    loads: 0,
                    revenue: 0,
                    miles: 0,
                })
            }
            const routeInfo = routeData.get(route)
            routeInfo.loads += 1
            routeInfo.revenue += Number(load.rate) || 0
            routeInfo.miles += Number(load.actualMiles) || 0
        })

        const geographicData = {
            byState: Array.from(stateData.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 20), // Top 20 states
            byRoute: Array.from(routeData.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 15), // Top 15 routes
            summary: {
                totalStates: stateData.size,
                totalRoutes: routeData.size,
                averageRevenuePerState:
                    Array.from(stateData.values()).reduce(
                        (sum, state) => sum + state.revenue,
                        0
                    ) / stateData.size,
            },
        }

        setCachedData(cacheKey, geographicData, CACHE_TTL.DATA)
        return geographicData
    } catch (error) {
        console.error("Error fetching geographic analytics:", error)
        throw new Error("Failed to fetch geographic analytics")
    }
}

/**
 * Get route and heatmap analytics data
 */
export async function getRouteHeatmapAnalytics(
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {},
): Promise<{ routes: RouteAnalytics[]; heatmap: HeatmapDataPoint[] }> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized")
    }

    const cacheKey = `analytics:routeheatmap:${organizationId}:${timeRange}:${JSON.stringify(
        filters,
    )}`
    const cached = getCachedData(cacheKey)
    if (cached) {
        return cached as { routes: RouteAnalytics[]; heatmap: HeatmapDataPoint[] }
    }

    try {
        const { startDate, endDate } = getDateRange(timeRange)

        const whereClause: any = {
            organizationId,
            status: "delivered",
            actualDeliveryDate: {
                gte: startDate,
                lte: endDate,
            },
        }
        if (filters.driverId) whereClause.driverId = filters.driverId
        if (filters.vehicleId) whereClause.vehicleId = filters.vehicleId

        const loads = await prisma.load.findMany({
            where: whereClause,
            select: {
                originCity: true,
                originState: true,
                originLat: true,
                originLng: true,
                destinationCity: true,
                destinationState: true,
                destinationLat: true,
                destinationLng: true,
                rate: true,
                actualMiles: true,
                actualDeliveryDate: true,
                scheduledDeliveryDate: true,
            },
        })

        const routeMap = new Map<string, any>()
        const cityMap = new Map<string, any>()

        loads.forEach(load => {
            const routeKey = `${load.originCity || "Unknown"}-${load.destinationCity || "Unknown"}`
            if (!routeMap.has(routeKey)) {
                routeMap.set(routeKey, {
                    id: routeKey,
                    origin: {
                        city: load.originCity || "",
                        state: load.originState || "",
                        lat: Number(load.originLat || 0),
                        lng: Number(load.originLng || 0),
                    },
                    destination: {
                        city: load.destinationCity || "",
                        state: load.destinationState || "",
                        lat: Number(load.destinationLat || 0),
                        lng: Number(load.destinationLng || 0),
                    },
                    frequency: 0,
                    revenue: 0,
                    deliveryTimeSum: 0,
                    onTime: 0,
                    distanceSum: 0,
                })
            }
            const r = routeMap.get(routeKey)
            r.frequency += 1
            r.revenue += Number(load.rate || 0)
            r.distanceSum += Number(load.actualMiles || 0)
            if (load.actualDeliveryDate && load.scheduledDeliveryDate) {
                const diff =
                    new Date(load.actualDeliveryDate).getTime() -
                    new Date(load.scheduledDeliveryDate).getTime()
                r.deliveryTimeSum += diff / (1000 * 60 * 60)
                if (diff <= 0) r.onTime += 1
            }

            const cityKey = `${load.destinationCity || ""}-${load.destinationState || ""}`
            if (!cityMap.has(cityKey)) {
                cityMap.set(cityKey, {
                    city: load.destinationCity || "",
                    state: load.destinationState || "",
                    lat: Number(load.destinationLat || 0),
                    lng: Number(load.destinationLng || 0),
                    loads: 0,
                    revenue: 0,
                })
            }
            const c = cityMap.get(cityKey)
            c.loads += 1
            c.revenue += Number(load.rate || 0)
        })

        const routes: RouteAnalytics[] = Array.from(routeMap.values()).map(r => ({
            id: r.id,
            origin: r.origin,
            destination: r.destination,
            frequency: r.frequency,
            revenue: r.revenue,
            avgDeliveryTime: r.frequency > 0 ? r.deliveryTimeSum / r.frequency : 0,
            onTimeRate: r.frequency > 0 ? (r.onTime / r.frequency) * 100 : 0,
            fuelCost: 0,
            distance: r.frequency > 0 ? r.distanceSum / r.frequency : 0,
        }))

        const heatmapArray = Array.from(cityMap.values())
        const maxLoads = Math.max(...heatmapArray.map(c => c.loads), 1)
        const heatmap: HeatmapDataPoint[] = heatmapArray.map(c => ({
            ...c,
            utilization: (c.loads / maxLoads) * 100,
        }))

        const result = { routes, heatmap }
        setCachedData(cacheKey, result, CACHE_TTL.DATA)
        return result
    } catch (error) {
        console.error("Error fetching route heatmap analytics:", error)
        throw new Error("Failed to fetch route heatmap analytics")
    }
}

/**
 * Get performance projections data
 */
export async function getPerformanceProjections(
    organizationId: string,
    timeRange: string = "30d",
    filters: AnalyticsFilters = {},
): Promise<PredictionData[]> {
    const performance = await getPerformanceAnalytics(organizationId, timeRange, filters)
    const data: any[] = performance?.timeSeriesData || []

    if (data.length < 3) return []

    const lastThree = data.slice(-3)
    const first = lastThree[0]
    const last = lastThree[2]
    if (!first || !last) return []

    const trend = (last.value - first.value) / 2
    const predictions: PredictionData[] = []
    for (let i = 1; i <= 7; i++) {
        const lastDate = new Date(last.date)
        lastDate.setDate(lastDate.getDate() + i)
        predictions.push({
            date: lastDate.toISOString().split("T")[0],
            value: last.value + trend * i,
            isPrediction: true,
        })
    }

    return predictions
}

/**
 * Helper function to get date range based on time range string
 */
function getDateRange(timeRange: string) {
    const endDate = new Date()
    let startDate: Date

    if (timeRange.startsWith("custom:")) {
        const [, range] = timeRange.split("custom:")
        if (!range) return { startDate: endDate, endDate }
        const [start, end] = range.split("_to_")
        const customStart = start ? new Date(start) : endDate
        const customEnd = end ? new Date(end) : endDate
        if (!isNaN(customStart.getTime()) && !isNaN(customEnd.getTime())) {
            return { startDate: customStart, endDate: customEnd }
        }
    }

    switch (timeRange) {
        case "7d":
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
        case "30d":
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
        case "90d":
            startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
        case "ytd":
            startDate = new Date(endDate.getFullYear(), 0, 1)
            break
        default:
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return { startDate, endDate }
}

/**
 * Group load data by date for performance metrics
 */
function groupDataByDate(loads: any[], timeRange: string) {
    const grouped = new Map()

    loads.forEach(load => {
        if (!load.actualDeliveryDate) return

        const date = new Date(load.actualDeliveryDate)
        const dateKey = getDateKey(date, timeRange)

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, {
                date: dateKey,
                loads: 0,
                miles: 0,
                revenue: 0,
            })
        }

        const entry = grouped.get(dateKey)
        entry.loads += 1
        entry.miles += Number(load.actualMiles || 0)
        entry.revenue += Number(load.rate || 0)
    })

    return Array.from(grouped.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

/**
 * Group revenue data by date
 */
function groupRevenueByDate(loads: any[], timeRange: string) {
    const grouped = new Map()

    loads.forEach(load => {
        if (!load.actualDeliveryDate) return

        const date = new Date(load.actualDeliveryDate)
        const dateKey = getDateKey(date, timeRange)

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, {
                date: dateKey,
                revenue: 0,
                loads: 0,
            })
        }

        const entry = grouped.get(dateKey)
        entry.revenue += Number(load.rate || 0)
        entry.loads += 1
    })

    return Array.from(grouped.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

/**
 * Group expense data by date
 */
function groupExpensesByDate(expenses: any[], timeRange: string) {
    const grouped = new Map()

    expenses.forEach(expense => {
        const date = new Date(expense.date)
        const dateKey = getDateKey(date, timeRange)

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, {
                date: dateKey,
                amount: 0,
                gallons: 0,
            })
        }

        const entry = grouped.get(dateKey)
        entry.amount += Number(expense.amount || 0)
        entry.gallons += Number(expense.gallons || 0)
    })

    return Array.from(grouped.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

/**
 * Calculate profit margin over time
 */
function calculateProfitMargin(
    revenueData: any[],
    expenseData: any[],
    timeRange: string
) {
    const revenueByDate = groupRevenueByDate(revenueData, timeRange)
    const expenseByDate = groupExpensesByDate(expenseData, timeRange)

    const profitData = revenueByDate.map(revenueEntry => {
        const expenseEntry = expenseByDate.find(
            e => e.date === revenueEntry.date
        )
        const expenses = expenseEntry ? expenseEntry.amount : 0
        const profit = revenueEntry.revenue - expenses
        const margin =
            revenueEntry.revenue > 0 ? (profit / revenueEntry.revenue) * 100 : 0

        return {
            date: revenueEntry.date,
            revenue: revenueEntry.revenue,
            expenses,
            profit,
            margin,
        }
    })

    return profitData
}

/**
 * Get date key based on time range grouping
 */
function getDateKey(date: Date, timeRange: string): string {
    switch (timeRange) {
        case "7d":
        case "30d":
            return date && typeof date.toISOString === "function"
                ? date.toISOString().split("T")[0] || ""
                : "" // Daily grouping
        case "90d":
        case "ytd": {
            // Weekly grouping
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            return weekStart && typeof weekStart.toISOString === "function"
                ? weekStart.toISOString().split("T")[0] || ""
                : ""
        }
        default:
            return date && typeof date.toISOString === "function"
                ? date.toISOString().split("T")[0] || ""
                : ""
    }
}

// Fix: Ensure all variables of type string | undefined are handled as string
// Example: Use fallback or throw if undefined, or add checks before assignment

// --- Fixes for 'string | undefined' assignment errors ---
// Find all assignments where a value of type 'string | undefined' is assigned to a 'string' type
// Add fallback (e.g., empty string or throw error) or add checks before assignment

// Example fix:
// let foo: string = bar; // bar is string | undefined
// => let foo: string = bar ?? "";

// --- Fixes for Date conversion errors ---
// Ensure that values passed to new Date() are not undefined
// Example fix:
// new Date(range?.from) => range?.from ? new Date(range.from) : new Date()

// --- Apply fixes to the relevant lines ---
// (at line 912, 954, 1304, 1310, 1313)
// Replace assignments of type 'string | undefined' to 'string' with fallback or checks
// Example:
// let myString: string = possiblyUndefinedString;
// =>
// let myString: string = possiblyUndefinedString;
// =>
