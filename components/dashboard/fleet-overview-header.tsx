/** @format */

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardSummary } from "@/lib/fetchers/analyticsFetchers"
import type { DashboardSummary } from "@/types/kpi"
import { Activity, RefreshCw } from "lucide-react"

interface FleetOverviewHeaderProps {
    orgId: string
}

export default async function FleetOverviewHeader({
    orgId,
}: FleetOverviewHeaderProps) {
    if (!orgId) {
        return (
            <Card className='border-red-200 bg-red-50'>
                <CardContent className='p-4'>
                    <p className='text-red-600'>Organization not found.</p>
                </CardContent>
            </Card>
        )
    }

    let summary: DashboardSummary | null = null
    let lastUpdated: string | null = null

    try {
        const rawSummary = await getDashboardSummary(orgId)
        // Ensure totalVehicles is present for kpi DashboardSummary
        summary = {
            ...rawSummary,
            totalVehicles:
                // Use activeVehicles as a proxy for total vehicles, since totalVehicles does not exist
                rawSummary.activeVehicles ?? 0,
        }
        lastUpdated = summary?.lastUpdated
            ? new Date(summary.lastUpdated).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : null
    } catch {
        summary = null
        lastUpdated = null
    }

    return (
        <Card className='bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700'>
            <CardHeader className='pb-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className='space-y-2'>
                        <div className='flex items-center gap-3'>
                            <CardTitle className='text-2xl font-bold flex items-center gap-2'>
                                <Activity className='h-6 w-6' />
                                Fleet Overview
                            </CardTitle>
                            <Badge className='bg-green-500 text-green-100 border-green-400 hover:bg-green-500'>
                                <div className='w-2 h-2 bg-green-200 rounded-full mr-1 animate-pulse'></div>
                                Live
                            </Badge>
                        </div>
                        <p className='text-blue-100 text-sm'>
                            Real-time insights into your fleet operations and
                            performance
                        </p>
                    </div>

                    <div className='flex items-center gap-3 text-sm text-blue-100'>
                        <div className='flex items-center gap-2'>
                            <RefreshCw className='h-4 w-4' />
                            <span>Last updated:</span>
                        </div>
                        <Badge
                            variant='secondary'
                            className='bg-blue-800 text-blue-100 border-blue-600'
                        >
                            {lastUpdated || "Never"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            {summary && (
                <CardContent className='pt-0'>
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                        <div className='text-center'>
                            <div className='text-xl font-bold text-white'>
                                {summary.totalVehicles || 0}
                            </div>
                            <div className='text-xs text-blue-200'>
                                Total Vehicles
                            </div>
                        </div>
                        <div className='text-center'>
                            <div className='text-xl font-bold text-green-200'>
                                {summary.activeDrivers || 0}
                            </div>
                            <div className='text-xs text-blue-200'>
                                Active Drivers
                            </div>
                        </div>
                        <div className='text-center'>
                            <div className='text-xl font-bold text-white'>
                                {summary.lastUpdated ? "✓" : "⚠️"}
                            </div>
                            <div className='text-xs text-blue-200'>Status</div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
