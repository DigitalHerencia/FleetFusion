/** @format */

import {
    BarChart3,
    DollarSign,
    Filter,
    MapPin,
    TrendingUp,
    Truck,
    User,
} from "lucide-react"

import { DriverPerformance } from "@/components/analytics/driver-performance"
import { ExportOptions } from "@/components/analytics/export-options"
import { FinancialMetrics } from "@/components/analytics/financial-metrics"
import { GeographicAnalysis } from "@/components/analytics/geographic-analysis"
import { InteractiveCharts } from "@/components/analytics/interactive-charts"
import { MobileAnalytics } from "@/components/analytics/mobile-analytics"
import { PerformanceMetrics } from "@/features/analytics/performance-metrics"
import { RealtimeDashboard } from "@/components/analytics/realtime-dashboard"
import { VehicleUtilization } from "@/components/analytics/vehicle-utilization"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    getDashboardSummary,
    getDriverAnalytics,
    getFinancialAnalytics,
    getPerformanceAnalytics,
    getVehicleAnalytics,
} from "@/lib/fetchers/analyticsFetchers"
import { listDriversByOrg } from "@/lib/fetchers/driverFetchers"

interface PerformanceDataPoint {
    date: string
    revenue?: number
    loads?: number
    miles?: number
    drivers?: number
    vehicles?: number
    revenuePerMile?: number
}

// Import types
import { ProfitabilityMetrics, TimeSeriesData } from "@/types/analytics"

export default async function AnalyticsPage({
    params,
    searchParams,
}: {
    params: Promise<{ orgId: string; userId?: string }>
    searchParams?: Promise<{ start?: string; end?: string; driver?: string }>
}) {
    const { orgId, userId } = await params
    const sp = searchParams ? await searchParams : undefined

    const start = sp?.start
    const end = sp?.end
    const driver = sp?.driver

    let timeRange = "30d"
    if (start && end) {
        timeRange = `custom:${start}_to_${end}`
    }

    const today = new Date()
    const defaultEnd = end ?? today.toISOString().split("T")[0]
    const defaultStart =
        start ??
        new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]

    // Fetch all analytics data in parallel
    const filters = driver ? { driverId: driver } : {}

    const [
        summary,
        performanceDataRaw,
        financialDataRaw,
        driverPerformanceMetricsRaw,
        vehicleDataRaw,
        driversList,
    ] = await Promise.all([
        getDashboardSummary(orgId, timeRange, filters),
        getPerformanceAnalytics(orgId, timeRange, filters),
        getFinancialAnalytics(orgId, timeRange, filters),
        getDriverAnalytics(orgId, timeRange, filters),
        getVehicleAnalytics(orgId, timeRange, filters),
        listDriversByOrg(orgId, { limit: 100 }),
    ])
    // Defensive: ensure arrays/objects for all analytics data
    const performanceData = Array.isArray(performanceDataRaw)
        ? performanceDataRaw
        : []
    const driverPerformanceMetrics = Array.isArray(driverPerformanceMetricsRaw)
        ? driverPerformanceMetricsRaw
        : []
    const vehicleData = Array.isArray(vehicleDataRaw) ? vehicleDataRaw : []
    const drivers = Array.isArray(driversList?.drivers)
        ? driversList.drivers
        : []
    // Process financial data to match component expectations
    const rawFinancialData =
        financialDataRaw &&
        typeof financialDataRaw === "object" &&
        financialDataRaw !== null
            ? {
                  revenue: Array.isArray((financialDataRaw as any).revenue)
                      ? (financialDataRaw as any).revenue
                      : [],
                  expenses: Array.isArray((financialDataRaw as any).expenses)
                      ? (financialDataRaw as any).expenses
                      : [],
                  profitMargin: Array.isArray(
                      (financialDataRaw as any).profitMargin
                  )
                      ? (financialDataRaw as any).profitMargin
                      : [],
              }
            : { revenue: [], expenses: [], profitMargin: [] }
    // Create ProfitabilityMetrics for components that expect it
    const profitabilityMetrics: ProfitabilityMetrics = {
        timeframe: {
            start: start
                ? new Date(start)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: end ? new Date(end) : new Date(),
            period: "daily",
        },
        grossRevenue: summary?.totalRevenue || 0,
        totalExpenses: 0, // Would come from financial data
        netProfit: summary?.totalRevenue || 0,
        profitMargin: 15.5, // Default value
        operatingRatio: 0.85,
        costPerMile: 2.5,
        revenuePerMile: summary?.averageRevenuePerMile || 0,
        profitPerMile: (summary?.averageRevenuePerMile || 0) - 2.5,
        profitByPeriod: rawFinancialData.profitMargin.map(
            (item: any, index: number) => ({
                period: `Period ${index + 1}`,
                profit: item.value || 0,
                margin: item.margin || 15.5,
            })
        ),
    }

    // Convert PerformanceDataPoint to TimeSeriesData format
    const timeSeriesData: TimeSeriesData[] = performanceData.map(
        (item: any) => ({
            date: item.date,
            value: item.revenue || 0,
            label: `Revenue: $${item.revenue || 0}`,
        })
    )

    // Metrics for cards
    const metrics = [
        {
            icon: <DollarSign className='h-4 w-4 text-[hsl(var(--info))]' />,
            label: "Total Revenue",
            value: summary ? `$${summary.totalRevenue.toLocaleString()}` : "-",
            change:
                summary && summary.totalRevenue && summary.averageRevenuePerMile
                    ? `Avg $${summary.averageRevenuePerMile.toFixed(2)}/mile`
                    : "",
        },
        {
            icon: <Truck className='h-4 w-4 text-[hsl(var(--info))]' />,
            label: "Total Miles",
            value: summary ? summary.totalMiles.toLocaleString() : "-",
            change:
                summary && summary.totalMiles
                    ? `Loads: ${summary.totalLoads}`
                    : "",
        },
        {
            icon: <BarChart3 className='h-4 w-4 text-[hsl(var(--info))]' />,
            label: "Load Count",
            value: summary ? summary.totalLoads.toLocaleString() : "-",
            change:
                summary && summary.totalLoads
                    ? `Drivers: ${summary.activeDrivers}`
                    : "",
        },
        {
            icon: <User className='h-4 w-4 text-[hsl(var(--info))]' />,
            label: "Active Vehicles",
            value: summary ? summary.activeVehicles.toLocaleString() : "-",
            change: summary && summary.activeVehicles ? `Active` : "",
        },
    ]
    return (
        <div className='mx-auto min-h-screen w-full max-w-7xl space-y-6 bg-neutral-900 p-6 pt-8'>
            {/* Mobile Detection for Conditional Rendering */}{" "}
            <div className='block md:hidden'>
                <MobileAnalytics
                    data={{
                        summary,
                        performanceData,
                        financialData: profitabilityMetrics,
                        driverPerformanceMetrics,
                        vehicleData,
                        timeSeriesData: timeSeriesData, // Use the converted TimeSeriesData
                    }}
                    orgId={orgId}
                    timeRange={timeRange}
                />
            </div>
            <div className='mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                <div>
                    <h1 className='mb-1 text-3xl font-extrabold text-white'>
                        Analytics Dashboard
                    </h1>
                    <p className='text-base text-white/90'>
                        Track and analyze fleet performance metrics with
                        advanced insights
                    </p>
                </div>{" "}
                <div className='mt-4 flex flex-col gap-2 md:mt-0 md:flex-row'>
                    <ExportOptions
                        orgId={orgId}
                        filters={filters}
                        data={{
                            summary,
                            performanceData,
                            financialData: profitabilityMetrics,
                            driverPerformanceMetrics,
                            vehicleData,
                            timeSeriesData,
                        }}
                    />
                </div>
            </div>
            <RealtimeDashboard
                orgId={orgId}
                initial={summary}
                timeRange={timeRange}
                driver={driver ?? undefined}
                metrics={metrics}
            />
            <Tabs
                defaultValue='performance'
                className='w-full'
            >
                <TabsList className='grid w-full grid-cols-3 md:w-auto md:grid-cols-7'>
                    <TabsTrigger value='performance'>Performance</TabsTrigger>
                    <TabsTrigger value='financial'>Financial</TabsTrigger>
                    <TabsTrigger value='drivers'>Drivers</TabsTrigger>
                    <TabsTrigger value='vehicles'>Vehicles</TabsTrigger>
                    <TabsTrigger value='interactive'>
                        <TrendingUp className='mr-1 h-4 w-4' />
                        <span className='hidden sm:inline'>Interactive</span>
                    </TabsTrigger>
                    <TabsTrigger value='geographic'>
                        <MapPin className='mr-1 h-4 w-4' />
                        <span className='hidden sm:inline'>Geographic</span>
                    </TabsTrigger>
                    <TabsTrigger value='advanced'>
                        <Filter className='mr-1 h-4 w-4' />
                        <span className='hidden sm:inline'>Advanced</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    value='performance'
                    className='mt-4'
                >
                    <Card className='rounded-md border border-gray-200 bg-black'>
                        <CardHeader className='pt-4 pb-2'>
                            <span className='text-lg font-bold text-white'>
                                Performance Metrics
                            </span>
                        </CardHeader>
                        <CardContent className='overflow-x-auto pb-4'>
                            <PerformanceMetrics
                                timeRange={timeRange}
                                performanceData={performanceData}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent
                    value='financial'
                    className='mt-4'
                >
                    <Card className='rounded-md border border-gray-200 bg-black'>
                        <CardHeader className='pt-4 pb-2'>
                            <span className='text-lg font-bold text-white'>
                                Financial Metrics
                            </span>
                        </CardHeader>
                        <CardContent className='overflow-x-auto pb-4'>
                            {" "}
                            <FinancialMetrics
                                timeRange={timeRange}
                                financialData={[profitabilityMetrics]}
                                expenseBreakdown={[]}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent
                    value='drivers'
                    className='mt-4'
                >
                    <Card className='rounded-md border border-gray-200 bg-black'>
                        <CardHeader className='pt-4 pb-2'>
                            <span className='text-lg font-bold text-white'>
                                Driver Performance
                            </span>
                        </CardHeader>
                        <CardContent className='overflow-x-auto pb-4'>
                            <DriverPerformance
                                timeRange={timeRange}
                                driverPerformanceMetrics={
                                    driverPerformanceMetrics
                                }
                            />
                        </CardContent>
                    </Card>
                </TabsContent>{" "}
                <TabsContent
                    value='vehicles'
                    className='mt-4'
                >
                    <Card className='rounded-md border border-gray-200 bg-black'>
                        <CardHeader className='pt-4 pb-2'>
                            <span className='text-lg font-bold text-white'>
                                Vehicle Utilization
                            </span>
                        </CardHeader>
                        <CardContent className='overflow-x-auto pb-4'>
                            <VehicleUtilization
                                timeRange={timeRange}
                                vehicleData={vehicleData}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent
                    value='interactive'
                    className='mt-4'
                >
                    <Card className='rounded-md border border-gray-200 bg-black'>
                        <CardHeader className='pt-4 pb-2'>
                            <span className='text-lg font-bold text-white'>
                                Interactive Analytics & Predictive Insights
                            </span>
                        </CardHeader>
                        <CardContent className='overflow-x-auto pb-4'>
                            {" "}
                            <InteractiveCharts
                                data={{
                                    summary,
                                    performanceData,
                                    financialData: profitabilityMetrics,
                                    driverPerformanceMetrics,
                                    vehicleData,
                                    timeSeriesData,
                                }}
                                timeRange={timeRange}
                                orgId={orgId}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent
                    value='geographic'
                    className='mt-4'
                >
                    <Card className='rounded-md border border-gray-200 bg-black'>
                        <CardHeader className='pt-4 pb-2'>
                            <span className='text-lg font-bold text-white'>
                                Geographic Analysis & Route Optimization
                            </span>
                        </CardHeader>
                        <CardContent className='overflow-x-auto pb-4'>
                            {" "}
                            <GeographicAnalysis
                                data={{
                                    summary,
                                    performanceData,
                                    financialData: profitabilityMetrics,
                                    driverPerformanceMetrics,
                                    vehicleData,
                                    timeSeriesData,
                                }}
                                orgId={orgId}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent
                    value='advanced'
                    className='mt-4'
                >
                    <div className='grid gap-4'>
                        <Card className='rounded-md border border-gray-200 bg-black'>
                            <CardHeader className='pt-4 pb-2'>
                                <span className='text-lg font-bold text-white'>
                                    Advanced Filtering & Analysis
                                </span>
                            </CardHeader>
                            <CardContent className='pb-4'>
                                <div className='space-y-6'>
                                    <div className='text-sm text-white/80'>
                                        Use advanced filters to drill down into
                                        specific metrics and create custom
                                        reports.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='rounded-md border border-gray-200 bg-black'>
                            <CardHeader className='pt-4 pb-2'>
                                <span className='text-lg font-bold text-white'>
                                    Export & Reporting Options
                                </span>
                            </CardHeader>
                            <CardContent className='pb-4'>
                                <div className='space-y-6'>
                                    <div className='text-sm text-white/80'>
                                        Generate reports, schedule automated
                                        exports, and create custom dashboards.
                                    </div>
                                    <ExportOptions
                                        orgId={orgId}
                                        filters={filters}
                                        data={{
                                            summary,
                                            performanceData,
                                            financialData: profitabilityMetrics,
                                            driverPerformanceMetrics,
                                            vehicleData,
                                            timeSeriesData,
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
