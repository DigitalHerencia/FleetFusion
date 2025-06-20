/** @format */

"use client"

import {
    BarChart,
    Calendar,
    Download,
    FileText,
    TrendingUp,
} from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { IftaPeriodData } from "@/types/ifta"

import { IftaReportTable } from "./ifta-report-table"
import { IftaTripTable } from "./ifta-trip-table"

type IftaData = IftaPeriodData

export function IftaDashboard() {
    const params = useParams()
    const orgId = params?.orgId as string
    const [quarter, setQuarter] = useState("2025-Q2")
    const [iftaData, setIftaData] = useState<IftaPeriodData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchIftaData = async () => {
            if (!orgId) return

            try {
                setLoading(true)
                const [quarterPart, yearPart] = quarter.split("-")

                if (!quarterPart || !yearPart) {
                    setError("Invalid quarter format")
                    setLoading(false)
                    return
                }
            } catch (err) {
                console.error("Error fetching IFTA data:", err)
                setError("Failed to load IFTA data")
                // Set default data for UI demonstration                // Parse quarter string (e.g., "2025-Q2") into { year: number, quarter: number }
                const [yearStr, qStr] = quarter.split("-")
                setIftaData({
                    period: {
                        year: Number(yearStr),
                        quarter: Number(qStr?.replace("Q", "") ?? "1"),
                    },
                    summary: {
                        totalMiles: 0,
                        totalGallons: 0,
                        averageMpg: 0,
                        totalFuelCost: 0,
                    },
                    trips: [],
                    fuelPurchases: [],
                    jurisdictionSummary: [],
                    report: null,
                })
            } finally {
                setLoading(false)
            }
        }

        fetchIftaData()
    }, [orgId, quarter])

    const handleQuarterChange = (newQuarter: string) => {
        setQuarter(newQuarter)
    }

    return (
        <div className='flex flex-col space-y-6'>
            <div className='flex flex-row flex-wrap items-center justify-between gap-6'>
                <div className='flex min-w-0 flex-col gap-1'>
                    <h2 className='text-3xl font-bold tracking-tight whitespace-nowrap'>
                        IFTA Management
                    </h2>
                    <p className='text-muted-foreground whitespace-nowrap'>
                        Track and manage International Fuel Tax Agreement
                        reporting
                    </p>
                </div>

                <div className='flex w-full max-w-xs flex-col gap-2 sm:w-auto'>
                    <Select
                        value={quarter}
                        onValueChange={handleQuarterChange}
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select Quarter' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='2025-Q1'>2025 Q1</SelectItem>
                            <SelectItem value='2025-Q2'>2025 Q2</SelectItem>
                            <SelectItem value='2025-Q3'>2025 Q3</SelectItem>
                            <SelectItem value='2025-Q4'>2025 Q4</SelectItem>
                            <SelectItem value='2024-Q1'>2024 Q1</SelectItem>
                            <SelectItem value='2024-Q2'>2024 Q2</SelectItem>
                            <SelectItem value='2024-Q3'>2024 Q3</SelectItem>
                            <SelectItem value='2024-Q4'>2024 Q4</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        size='sm'
                        className='w-full'
                    >
                        <span className='flex w-full items-center justify-center'>
                            <FileText className='mr-2 h-4 w-4' />
                            Generate Report
                        </span>
                    </Button>
                </div>

                {loading ? (
                    <div className='flex h-32 items-center justify-center'>
                        <div className='text-muted-foreground text-sm'>
                            Loading IFTA data...
                        </div>
                    </div>
                ) : error ? (
                    <div className='flex h-32 items-center justify-center'>
                        <div className='text-sm text-red-500'>{error}</div>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Total Miles
                                    </CardTitle>
                                    <BarChart className='text-muted-foreground h-4 w-4' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>
                                        {iftaData?.summary.totalMiles?.toLocaleString() ||
                                            "0"}
                                    </div>
                                    <p className='text-muted-foreground text-xs'>
                                        For {quarter.replace("-", " ")}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Fuel Purchased
                                    </CardTitle>
                                    <BarChart className='text-muted-foreground h-4 w-4' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>
                                        {iftaData?.summary.totalGallons?.toLocaleString() ||
                                            "0"}{" "}
                                        gal
                                    </div>
                                    <p className='text-muted-foreground text-xs'>
                                        For {quarter.replace("-", " ")}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Average MPG
                                    </CardTitle>
                                    <TrendingUp className='text-muted-foreground h-4 w-4' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>
                                        {iftaData?.summary.averageMpg?.toFixed(
                                            2
                                        ) || "0.00"}
                                    </div>
                                    <p className='text-muted-foreground text-xs'>
                                        For {quarter.replace("-", " ")}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Fuel Cost
                                    </CardTitle>
                                    <FileText className='text-muted-foreground h-4 w-4' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>
                                        $
                                        {iftaData?.summary.totalFuelCost?.toLocaleString() ||
                                            "0.00"}
                                    </div>
                                    <p className='text-muted-foreground text-xs'>
                                        For {quarter.replace("-", " ")}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className='grid gap-4 md:grid-cols-2'>
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Quarterly Filing Status
                                    </CardTitle>
                                    <CardDescription>
                                        IFTA filing progress for{" "}
                                        {quarter.replace("-", " ")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-8'>
                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm font-medium'>
                                                    Trip Data Collection
                                                </span>
                                                <span className='text-muted-foreground text-sm'>
                                                    100%
                                                </span>
                                            </div>
                                            <Progress value={100} />
                                        </div>

                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm font-medium'>
                                                    Fuel Receipt Verification
                                                </span>
                                                <span className='text-muted-foreground text-sm'>
                                                    85%
                                                </span>
                                            </div>
                                            <Progress value={85} />
                                        </div>

                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm font-medium'>
                                                    Mileage Verification
                                                </span>
                                                <span className='text-muted-foreground text-sm'>
                                                    90%
                                                </span>
                                            </div>
                                            <Progress value={90} />
                                        </div>

                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm font-medium'>
                                                    Report Generation
                                                </span>
                                                <span className='text-muted-foreground text-sm'>
                                                    0%
                                                </span>
                                            </div>
                                            <Progress value={0} />
                                        </div>

                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm font-medium'>
                                                    Filing Submission
                                                </span>
                                                <span className='text-muted-foreground text-sm'>
                                                    0%
                                                </span>
                                            </div>
                                            <Progress value={0} />
                                        </div>
                                    </div>

                                    <div className='mt-6 flex items-center justify-between'>
                                        <div className='text-muted-foreground text-sm'>
                                            <Calendar className='mr-1 inline-block h-4 w-4' />
                                            Due: July 31, 2023
                                        </div>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                        >
                                            <Download className='mr-1 h-4 w-4' />
                                            Download Worksheet
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Jurisdiction Summary</CardTitle>
                                    <CardDescription>
                                        Miles traveled and fuel purchased by
                                        jurisdiction
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='rounded-md border'>
                                        <table className='w-full'>
                                            <thead>
                                                <tr className='bg-muted/50 border-b'>
                                                    <th className='p-2 text-left text-sm font-medium'>
                                                        Jurisdiction
                                                    </th>
                                                    <th className='p-2 text-right text-sm font-medium'>
                                                        Miles
                                                    </th>
                                                    <th className='p-2 text-right text-sm font-medium'>
                                                        Fuel (gal)
                                                    </th>
                                                    <th className='p-2 text-right text-sm font-medium'>
                                                        Tax
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(
                                                    iftaData?.jurisdictionSummary
                                                ) &&
                                                iftaData.jurisdictionSummary
                                                    .length > 0 ? (
                                                    iftaData.jurisdictionSummary.map(
                                                        (
                                                            jurisdiction: any,
                                                            index: number
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    jurisdiction.jurisdiction ||
                                                                    index
                                                                }
                                                                className='border-b'
                                                            >
                                                                <td className='p-2 text-sm font-medium'>
                                                                    {jurisdiction.jurisdiction ||
                                                                        "N/A"}
                                                                </td>
                                                                <td className='p-2 text-right text-sm'>
                                                                    {jurisdiction.totalMiles?.toLocaleString() ||
                                                                        "0"}
                                                                </td>
                                                                <td className='p-2 text-right text-sm'>
                                                                    {jurisdiction.totalGallons?.toLocaleString() ||
                                                                        "0"}
                                                                </td>
                                                                <td className='p-2 text-right text-sm'>
                                                                    $
                                                                    {jurisdiction.estimatedTax?.toFixed(
                                                                        2
                                                                    ) || "0.00"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                ) : (
                                                    <tr className='border-b'>
                                                        <td
                                                            colSpan={4}
                                                            className='text-muted-foreground p-4 text-center text-sm'
                                                        >
                                                            No jurisdiction data
                                                            available for{" "}
                                                            {quarter.replace(
                                                                "-",
                                                                " "
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className='mt-4 text-center'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                        >
                                            View All Jurisdictions
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs
                            defaultValue='trips'
                            className='space-y-4'
                        >
                            <TabsList>
                                <TabsTrigger value='trips'>
                                    Trip Data
                                </TabsTrigger>
                                <TabsTrigger value='fuel'>
                                    Fuel Purchases
                                </TabsTrigger>
                                <TabsTrigger value='reports'>
                                    Past Reports
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value='trips'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Trip Data</CardTitle>
                                        <CardDescription>
                                            Record of trips for IFTA reporting
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <IftaTripTable
                                            trips={(iftaData?.trips || []).map(
                                                (trip: any) => ({
                                                    // Map/transform fields from IftaTripRecord to TripReport
                                                    tenantId:
                                                        trip.tenantId ?? "",
                                                    driverId:
                                                        trip.driverId ?? "",
                                                    startDate:
                                                        trip.startDate ?? "",
                                                    endDate: trip.endDate ?? "",
                                                    vehicleId:
                                                        trip.vehicleId ?? "",
                                                    jurisdiction:
                                                        trip.jurisdiction ?? "",
                                                    miles: trip.miles ?? 0,
                                                    fuelUsed:
                                                        trip.fuelUsed ?? 0,
                                                    notes: trip.notes ?? "",
                                                    // ...add any other required TripReport fields with fallbacks...
                                                    // Optionally, spread trip for extra fields if types overlap
                                                    ...trip,
                                                })
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value='fuel'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Fuel Purchases</CardTitle>
                                        <CardDescription>
                                            Record of fuel purchases for IFTA
                                            reporting
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='rounded-md border'>
                                            <table className='w-full'>
                                                <thead>
                                                    <tr className='bg-muted/50 border-b'>
                                                        <th className='p-2 text-left text-sm font-medium'>
                                                            Date
                                                        </th>
                                                        <th className='p-2 text-left text-sm font-medium'>
                                                            Vehicle
                                                        </th>
                                                        <th className='p-2 text-left text-sm font-medium'>
                                                            Location
                                                        </th>
                                                        <th className='p-2 text-left text-sm font-medium'>
                                                            Jurisdiction
                                                        </th>
                                                        <th className='p-2 text-right text-sm font-medium'>
                                                            Gallons
                                                        </th>
                                                        <th className='p-2 text-right text-sm font-medium'>
                                                            Price/Gal
                                                        </th>
                                                        <th className='p-2 text-right text-sm font-medium'>
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.isArray(
                                                        iftaData?.fuelPurchases
                                                    ) &&
                                                    iftaData.fuelPurchases
                                                        .length > 0 ? (
                                                        iftaData.fuelPurchases.map(
                                                            (
                                                                purchase: any,
                                                                index: number
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        purchase.id ||
                                                                        index
                                                                    }
                                                                    className='border-b'
                                                                >
                                                                    <td className='p-2 text-sm'>
                                                                        {new Date(
                                                                            purchase.date
                                                                        ).toLocaleDateString()}
                                                                    </td>
                                                                    <td className='p-2 text-sm'>
                                                                        {purchase.vehicleNumber ||
                                                                            "N/A"}
                                                                    </td>
                                                                    <td className='p-2 text-sm'>
                                                                        {purchase.location ||
                                                                            "N/A"}
                                                                    </td>
                                                                    <td className='p-2 text-sm'>
                                                                        {purchase.jurisdiction ||
                                                                            "N/A"}
                                                                    </td>
                                                                    <td className='p-2 text-right text-sm'>
                                                                        {purchase.gallons?.toFixed(
                                                                            1
                                                                        ) ||
                                                                            "0.0"}
                                                                    </td>
                                                                    <td className='p-2 text-right text-sm'>
                                                                        $
                                                                        {purchase.pricePerGallon?.toFixed(
                                                                            2
                                                                        ) ||
                                                                            "0.00"}
                                                                    </td>
                                                                    <td className='p-2 text-right text-sm'>
                                                                        $
                                                                        {purchase.totalCost?.toFixed(
                                                                            2
                                                                        ) ||
                                                                            "0.00"}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )
                                                    ) : (
                                                        <tr className='border-b'>
                                                            <td
                                                                colSpan={7}
                                                                className='text-muted-foreground p-4 text-center text-sm'
                                                            >
                                                                No fuel purchase
                                                                data available
                                                                for{" "}
                                                                {quarter.replace(
                                                                    "-",
                                                                    " "
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className='mt-4 flex justify-between'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                            >
                                                Add Fuel Purchase
                                            </Button>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                            >
                                                View All Purchases
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value='reports'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Past IFTA Reports</CardTitle>
                                        <CardDescription>
                                            History of filed IFTA reports
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <IftaReportTable />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    )
}

// validation function moved to lib/utils/ifta.ts
