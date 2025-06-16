/** @format */

import { BarChart3, CalendarIcon, FileText, MapPin } from "lucide-react"
import type React from "react"
import { Suspense } from "react"

import type { IFTAReport } from "@/components/ifta/ifta-columns"
import {
    IftaReportTableClient,
    IftaTripTableClient,
} from "@/components/ifta/ifta-tables"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    getIftaDataForPeriod,
    getIftaReports,
} from "@/lib/fetchers/iftaFetchers"
import type { IftaPeriodData } from "@/types/ifta"

// Define a custom FuelIcon component since it's not in lucide-react
function FuelIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            {...props}
        >
            <path d='M3 22h12' />
            <path d='M8 4v18' />
            <path d='M10 4v18' />
            <path d='M3 14h12' />
            <path d='M3 4h12' />
            <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2' />
            <path d='M22 18h-5' />
        </svg>
    )
}

// Server-side period selection state (default to current quarter)
function getCurrentQuarterAndYear() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const quarter = Math.floor(month / 3) + 1
    return { quarter, year }
}

export default async function Page({
    params,
}: {
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params // Default to current quarter/year, but allow query param override in the future
    const { quarter, year } = getCurrentQuarterAndYear()
    const period = `Q${quarter}`
    let iftaData: IftaPeriodData | null = null
    let reports: IFTAReport[] = []
    let error: string | null = null
    try {
        iftaData = await getIftaDataForPeriod(orgId, period, year.toString())
        const reportsRes = await getIftaReports(orgId, year)
        // Transform reports to IFTAReport[] for the table
        reports = (reportsRes?.data || []).map((r: any) => ({
            id: r.id,
            quarter: r.quarter ? `Q${r.quarter}` : "",
            year: r.year?.toString() ?? "",
            totalMiles: r.totalMiles ?? 0,
            totalGallons: r.totalGallons ?? 0,
            avgMpg:
                r.totalGallons && r.totalGallons > 0
                    ? Number(r.totalMiles) / Number(r.totalGallons)
                    : 0,
            status: r.status ?? "",
            dueDate: r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "",
        }))
    } catch (e: any) {
        error = e?.message || "Failed to load IFTA data"
    }

    // Helper for summary metrics
    const summary = iftaData?.summary || {
        totalMiles: 0,
        totalGallons: 0,
        averageMpg: 0,
        jurisdictions: 0,
    }
    const jurisdictionCount = Array.isArray(iftaData?.jurisdictionSummary)
        ? iftaData.jurisdictionSummary.length
        : 0

    return (
        <div className='ifta-page flex flex-col gap-6 p-4 md:p-6'>
            <div className='mb-2 flex flex-col gap-4 space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0'>
                <div>
                    <h1 className='page-title'>IFTA Management</h1>
                    <p className='page-subtitle'>
                        Track and manage International Fuel Tax Agreement
                        reporting
                    </p>
                </div>
                <div className='ml-8 flex flex-col gap-4 sm:flex-col'>
                    {/* TODO: Implement real period selection logic */}
                    <Button
                        variant='outline'
                        size='sm'
                        className='btn btn-outline w-full sm:w-auto'
                        disabled
                    >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {`Period: ${period} ${year}`}
                    </Button>
                    <Button
                        size='sm'
                        className='btn btn-primary w-full sm:w-auto'
                    >
                        <FileText className='mr-2 h-4 w-4' />
                        Generate Report
                    </Button>
                </div>
            </div>
            <PageHeader />
            {error ? (
                <div className='text-sm font-medium text-red-500'>{error}</div>
            ) : (
                <div className='flex flex-col gap-4'>
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card className='card'>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    Total Miles ({period} {year})
                                </CardTitle>
                                <MapPin className='h-4 w-4 text-[hsl(var(--info))]' />
                            </CardHeader>
                            <CardContent>
                                <div className='card-metric'>
                                    {summary.totalMiles?.toLocaleString() ?? 0}
                                </div>
                                <p className='text-xs text-[hsl(var(--success))]'>
                                    &nbsp;
                                </p>
                            </CardContent>
                        </Card>
                        <Card className='card'>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    Total Gallons ({period} {year})
                                </CardTitle>
                                <FuelIcon className='h-4 w-4 text-[hsl(var(--info))]' />
                            </CardHeader>
                            <CardContent>
                                <div className='card-metric'>
                                    {summary.totalGallons?.toLocaleString() ??
                                        0}
                                </div>
                                <p className='text-xs text-[hsl(var(--success))]'>
                                    &nbsp;
                                </p>
                            </CardContent>
                        </Card>
                        <Card className='card'>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    Average MPG
                                </CardTitle>
                                <BarChart3 className='h-4 w-4 text-[hsl(var(--info))]' />
                            </CardHeader>
                            <CardContent>
                                <div className='card-metric'>
                                    {summary.averageMpg?.toFixed(2) ?? 0}
                                </div>
                                <p className='text-xs text-[hsl(var(--success))]'>
                                    &nbsp;
                                </p>
                            </CardContent>
                        </Card>
                        <Card className='card'>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    Jurisdictions
                                </CardTitle>
                                <MapPin className='h-4 w-4 text-[hsl(var(--info))]' />
                            </CardHeader>
                            <CardContent>
                                <div className='card-metric'>
                                    {jurisdictionCount}
                                </div>
                                <p className='text-xs text-[hsl(var(--success))]'>
                                    States/provinces this period
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <Tabs
                        defaultValue='trips'
                        className='w-full'
                    >
                        <TabsList className='tabs grid w-full grid-cols-2 md:w-auto'>
                            <TabsTrigger value='trips'>
                                Trip Records
                            </TabsTrigger>
                            <TabsTrigger value='reports'>
                                Quarterly Reports
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value='trips'
                            className='mt-4'
                        >
                            <Card className='card'>
                                <CardHeader>
                                    <CardTitle>IFTA Trip Records</CardTitle>
                                    <CardDescription>
                                        Track interstate travel for IFTA
                                        reporting and tax calculations.
                                    </CardDescription>
                                </CardHeader>{" "}
                                <CardContent className='overflow-x-auto'>
                                    <Suspense
                                        fallback={
                                            <div>Loading IFTA trip data...</div>
                                        }
                                    >
                                        {" "}
                                        <IftaTripTableClient
                                            data={
                                                iftaData?.trips.map(trip => ({
                                                    id: trip.id,
                                                    date:
                                                        trip.date
                                                            .toISOString()
                                                            .split("T")[0] ??
                                                        trip.date.toISOString(),
                                                    driver:
                                                        trip.driver || "N/A",
                                                    vehicle:
                                                        trip.vehicle.unitNumber,
                                                    startLocation:
                                                        trip.startLocation ||
                                                        "N/A",
                                                    endLocation:
                                                        trip.endLocation ||
                                                        "N/A",
                                                    miles:
                                                        trip.miles ||
                                                        trip.distance,
                                                    gallons: trip.gallons || 0,
                                                    state:
                                                        trip.state ||
                                                        trip.jurisdiction,
                                                })) || []
                                            }
                                        />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent
                            value='reports'
                            className='mt-4'
                        >
                            <Card className='card'>
                                <CardHeader>
                                    <CardTitle>
                                        IFTA Quarterly Reports
                                    </CardTitle>
                                    <CardDescription>
                                        Manage and submit your quarterly IFTA
                                        tax reports.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='overflow-x-auto'>
                                    <Suspense
                                        fallback={
                                            <div>Loading IFTA reports...</div>
                                        }
                                    >
                                        <IftaReportTableClient data={reports} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    )
}
