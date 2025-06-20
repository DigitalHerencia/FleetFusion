/** @format */

"use client"

import { useDispatchRealtime } from "@/hooks/use-dispatch-realtime"
import type { $Enums, LoadPriority, LoadStatusEvent } from "@prisma/client"
import {
    Activity,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    PlusCircle,
    RefreshCw,
    Wifi,
    WifiOff,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { LoadCard } from "@/components/dispatch/load-card"
import { LoadDetailsDialog } from "@/components/dispatch/load-details-dialog"
import { LoadForm } from "@/components/dispatch/load-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateLoadAction } from "@/lib/actions/loadActions"
import type {
    BrokerInfo,
    CargoDetails,
    Customer,
    EquipmentRequirement,
    FactoringInfo,
    LoadAlert,
    LoadAssignedDriver,
    LoadAssignedTrailer,
    LoadAssignedVehicle,
    LoadDocument,
    LoadStatus,
    Rate,
    TrackingUpdate,
} from "@/types/dispatch"

interface Driver {
    id: string
    firstName: string
    lastName: string
    status: string
    email?: string
    phone?: string
}

interface Vehicle {
    status: $Enums.VehicleStatus
    id: string
    type: string
    make: string | null
    model: string | null
    year: number | null
    unitNumber: string
    currentOdometer: number | null
    lastInspectionDate: Date | null
    nextInspectionDue: Date | null
}

interface Load {
    id: string
    organizationId: string
    referenceNumber: string
    status: LoadStatus
    priority: LoadPriority
    customer: Customer
    origin: string
    destination: string
    pickupDate: Date
    deliveryDate: Date
    estimatedPickupTime?: string
    estimatedDeliveryTime?: string
    actualPickupTime?: Date
    actualDeliveryTime?: Date
    driver?: LoadAssignedDriver
    vehicle?: LoadAssignedVehicle
    trailer?: LoadAssignedTrailer
    equipment?: EquipmentRequirement
    cargo: CargoDetails
    rate: Rate
    miles?: number
    estimatedMiles?: number
    fuelCost?: number
    notes?: string
    internalNotes?: string
    specialInstructions?: string
    documents?: LoadDocument[]
    statusHistory?: LoadStatusEvent[]
    trackingUpdates?: TrackingUpdate[]
    brokerInfo?: BrokerInfo
    factoring?: FactoringInfo
    alerts?: LoadAlert[]
    tags?: string[]
    createdAt: Date
    updatedAt: Date
    createdBy?: string
    lastModifiedBy?: string
    statusEvents?: LoadStatusEvent[]
}

interface DispatchBoardProps {
    loads: Load[]
    drivers: Driver[]
    vehicles: Vehicle[]
    orgId: string
}

export function DispatchBoard({
    loads,
    drivers,
    vehicles,
    orgId,
}: DispatchBoardProps) {
    const router = useRouter()
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("all")
    // Real-time updates
    const {
        isConnected,
        connectionStatus,
        updateCount,
        lastUpdate,
        reconnect,
    } = useDispatchRealtime({
        orgId,
        pollingInterval: 30000, // 30 seconds
        enableSSE: true,
    })
    // Filter states
    const [filters, setFilters] = useState({
        status: "",
        driverId: "",
        origin: "",
        destination: "",
        dateRange: "",
    })

    // Loading states for status updates
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    // Pagination state for performance with large datasets
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(50) // Configurable page size
    const [viewMode, setViewMode] = useState<"paginated" | "all">("paginated")

    const pendingLoads = loads.filter(load => load.status === "pending")
    const assignedLoads = loads.filter(load => load.status === "assigned")
    const inTransitLoads = loads.filter(load => load.status === "in_transit")
    const completedLoads = loads.filter(load => load.status === "completed")

    const handleLoadClick = (load: Load) => {
        setSelectedLoad(load)
        setIsDetailsOpen(true)
    }

    const handleNewLoadClick = () => {
        setIsFormOpen(true)
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        // Refresh the page to show updated data
        router.refresh()
    }

    const handleFilterClick = () => {
        setIsFilterOpen(true)
    }

    // Filter apply function
    const applyFilters = () => {
        setIsFilterOpen(false)
        // Trigger a re-render by updating the active tab
        setActiveTab(activeTab)
    }

    // Reset filters function
    const resetFilters = () => {
        setFilters({
            status: "",
            driverId: "",
            origin: "",
            destination: "",
            dateRange: "",
        })
    }

    // Handle status updates
    const handleStatusUpdate = async (
        loadId: string,
        newStatus: LoadStatus
    ) => {
        setUpdatingId(loadId)
        try {
            const result = await updateLoadAction(loadId, {
                id: loadId,
                status: newStatus,
            })
        } catch (error) {
            // No toast/error UI
            // Optionally log error if needed
            // console.error('Error updating load status:', error);
        } finally {
            setUpdatingId(null)
        }
    }
    // Apply filters to loads
    const filterLoads = (loadsToFilter: Load[]) => {
        return loadsToFilter.filter(load => {
            if (filters.status && load.status !== filters.status) return false
            if (filters.driverId && load.driver?.id !== filters.driverId)
                return false
            if (filters.origin && load.origin !== filters.origin) return false
            if (filters.destination && load.destination !== filters.destination)
                return false

            // Date range filtering - simplified to show loads within last 30 days if "recent" is selected
            if (filters.dateRange === "recent") {
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                if (new Date(load.pickupDate) < thirtyDaysAgo) return false
            }

            return true
        })
    }

    // Pagination helper
    const paginateLoads = (loadsToPage: Load[]) => {
        if (viewMode === "all" || loadsToPage.length <= itemsPerPage) {
            return loadsToPage
        }

        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return loadsToPage.slice(startIndex, endIndex)
    }

    // Get total pages for a load array
    const getTotalPages = (totalItems: number) => {
        return Math.ceil(totalItems / itemsPerPage)
    }
    // Apply filters to each load category
    const filteredLoads = filterLoads(loads)
    const filteredPendingLoads = filterLoads(pendingLoads)
    const filteredAssignedLoads = filterLoads(assignedLoads)
    const filteredInTransitLoads = filterLoads(inTransitLoads)
    const filteredCompletedLoads = filterLoads(completedLoads)

    // Apply pagination to filtered results
    const paginatedLoads = paginateLoads(filteredLoads)
    const paginatedPendingLoads = paginateLoads(filteredPendingLoads)
    const paginatedAssignedLoads = paginateLoads(filteredAssignedLoads)
    const paginatedInTransitLoads = paginateLoads(filteredInTransitLoads)
    const paginatedCompletedLoads = paginateLoads(filteredCompletedLoads)

    // Performance indicator
    const shouldShowPagination = loads.length > itemsPerPage

    // Map vehicles to match LoadDetailsDialog expected type
    const mappedVehicles = vehicles.map(v => ({
        ...v,
        make: v.make || "",
        model: v.model ?? "",
    }))

    if (!loads || loads.length === 0) {
        return (
            <div className='py-12 text-center text-gray-400'>
                No loads found for this organization.
            </div>
        )
    }
    return (
        <div className='mt-6 space-y-6'>
            {" "}
            {/* Real-time status indicator */}
            <Card className='border-zinc-800 bg-zinc-900'>
                <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
                        <div className='flex items-center gap-2'>
                            {isConnected ? (
                                <div className='relative'>
                                    <Wifi className='h-4 w-4 text-green-500' />
                                    {connectionStatus === "connected" && (
                                        <div className='absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-green-400'></div>
                                    )}
                                </div>
                            ) : (
                                <WifiOff className='h-4 w-4 text-red-500' />
                            )}
                            <span className='text-sm font-medium'>
                                {connectionStatus === "connected"
                                    ? "Live Updates"
                                    : connectionStatus === "connecting"
                                    ? "Connecting..."
                                    : "Disconnected"}
                            </span>
                        </div>
                        {updateCount > 0 && (
                            <div className='flex items-center gap-2 text-sm text-gray-400'>
                                <Activity className='h-3 w-3 text-blue-400' />
                                <span className='hidden sm:inline'>
                                    {updateCount} updates received
                                </span>
                                <span className='sm:hidden'>
                                    {updateCount} updates
                                </span>
                                {lastUpdate && (
                                    <span className='hidden sm:inline'>
                                        • Last:{" "}
                                        {lastUpdate.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className='flex items-center gap-2'>
                        {connectionStatus === "connected" && (
                            <Badge
                                variant='outline'
                                className='border-green-500/30 bg-green-500/10 text-green-400'
                            >
                                <span className='hidden sm:inline'>
                                    Real-time
                                </span>
                                <span className='sm:hidden'>Live</span>
                            </Badge>
                        )}
                        {!isConnected && (
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={reconnect}
                                className='text-xs'
                            >
                                <RefreshCw className='mr-1 h-3 w-3' />
                                <span className='hidden sm:inline'>
                                    Reconnect
                                </span>
                                <span className='sm:hidden'>Retry</span>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            {/* Header with actions */}
            <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div className='flex w-full flex-col gap-2 md:w-auto'>
                    <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
                        <Button
                            size='sm'
                            className='w-full sm:w-auto'
                            onClick={handleNewLoadClick}
                        >
                            <PlusCircle className='mr-2 h-4 w-4' />
                            Add New Load
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            className='w-full sm:w-auto'
                            onClick={handleFilterClick}
                        >
                            <Filter className='mr-2 h-4 w-4' />
                            Filter
                        </Button>
                    </div>{" "}
                    {/* Quick stats */}
                    <div className='text-muted-foreground text-sm'>
                        <span className='hidden sm:inline'>
                            {filteredLoads.length} loads total •{" "}
                            {filteredPendingLoads.length} pending •{" "}
                            {filteredInTransitLoads.length} in transit
                        </span>
                        <span className='sm:hidden'>
                            {filteredLoads.length} total •{" "}
                            {filteredPendingLoads.length} pending •{" "}
                            {filteredInTransitLoads.length} transit
                        </span>
                    </div>
                </div>

                {/* Pagination and view controls */}
                {shouldShowPagination && (
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
                        {/* View mode toggle */}
                        <div className='flex items-center gap-2'>
                            <Label
                                htmlFor='view-mode'
                                className='text-sm text-muted-foreground'
                            >
                                View:
                            </Label>
                            <Select
                                value={viewMode}
                                onValueChange={(value: "paginated" | "all") => {
                                    setViewMode(value)
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className='w-[140px]'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='paginated'>
                                        <div className='flex items-center gap-2'>
                                            <BarChart3 className='h-4 w-4' />
                                            Paginated
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='all'>
                                        <div className='flex items-center gap-2'>
                                            <Eye className='h-4 w-4' />
                                            Show All
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Pagination controls */}
                        {viewMode === "paginated" && (
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                        setCurrentPage(prev =>
                                            Math.max(1, prev - 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className='h-8 w-8 p-0'
                                >
                                    <ChevronLeft className='h-4 w-4' />
                                </Button>

                                <span className='text-sm text-muted-foreground'>
                                    Page {currentPage} of{" "}
                                    {getTotalPages(filteredLoads.length)}
                                </span>

                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                        setCurrentPage(prev =>
                                            Math.min(
                                                getTotalPages(
                                                    filteredLoads.length
                                                ),
                                                prev + 1
                                            )
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        getTotalPages(filteredLoads.length)
                                    }
                                    className='h-8 w-8 p-0'
                                >
                                    <ChevronRight className='h-4 w-4' />
                                </Button>
                            </div>
                        )}

                        {/* Performance indicator */}
                        <div className='text-xs text-muted-foreground'>
                            {viewMode === "all" ? (
                                <span className='text-amber-400'>
                                    ⚠ Showing all {filteredLoads.length} loads
                                </span>
                            ) : (
                                <span>
                                    Showing{" "}
                                    {(currentPage - 1) * itemsPerPage + 1}-
                                    {Math.min(
                                        currentPage * itemsPerPage,
                                        filteredLoads.length
                                    )}{" "}
                                    of {filteredLoads.length}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Tabs
                defaultValue='all'
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full'
            >
                <div className='overflow-x-auto'>
                    <TabsList className='grid w-full min-w-[500px] grid-cols-5 rounded-md bg-zinc-800 p-1'>
                        <TabsTrigger
                            value='all'
                            className={
                                activeTab === "all"
                                    ? "border-primary border-b-2 bg-zinc-900 font-bold"
                                    : ""
                            }
                        >
                            All{" "}
                            <Badge
                                className={`ml-2 ${
                                    activeTab === "all"
                                        ? "bg-primary text-white"
                                        : "bg-zinc-900 text-white"
                                }`}
                            >
                                {filteredLoads.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value='pending'
                            className={
                                activeTab === "pending"
                                    ? "border-b-2 border-yellow-500 bg-zinc-900 font-bold"
                                    : ""
                            }
                        >
                            Pending{" "}
                            <Badge
                                className={`ml-2 ${
                                    activeTab === "pending"
                                        ? "bg-yellow-500 text-black"
                                        : "bg-yellow-500/30 text-yellow-200"
                                }`}
                            >
                                {filteredPendingLoads.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value='assigned'
                            className={
                                activeTab === "assigned"
                                    ? "border-b-2 border-blue-500 bg-zinc-900 font-bold"
                                    : ""
                            }
                        >
                            Assigned{" "}
                            <Badge
                                className={`ml-2 ${
                                    activeTab === "assigned"
                                        ? "bg-blue-500 text-white"
                                        : "bg-blue-500/30 text-blue-200"
                                }`}
                            >
                                {filteredAssignedLoads.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value='in_transit'
                            className={
                                activeTab === "in_transit"
                                    ? "border-b-2 border-indigo-500 bg-zinc-900 font-bold"
                                    : ""
                            }
                        >
                            In Transit{" "}
                            <Badge
                                className={`ml-2 ${
                                    activeTab === "in_transit"
                                        ? "bg-indigo-500 text-white"
                                        : "bg-indigo-500/30 text-indigo-200"
                                }`}
                            >
                                {filteredInTransitLoads.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value='completed'
                            className={
                                activeTab === "completed"
                                    ? "border-b-2 border-green-500 bg-zinc-900 font-bold"
                                    : ""
                            }
                        >
                            Completed{" "}
                            <Badge
                                className={`ml-2 ${
                                    activeTab === "completed"
                                        ? "bg-green-500 text-white"
                                        : "bg-green-500/30 text-green-200"
                                }`}
                            >
                                {filteredCompletedLoads.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>{" "}
                <TabsContent
                    value='all'
                    className='mt-4'
                >
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {paginatedLoads.length > 0 ? (
                            paginatedLoads.map(load => (
                                <Card
                                    key={load.id}
                                    className='flex h-full flex-col border border-gray-700 bg-neutral-900 shadow-lg'
                                >
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='truncate text-lg font-semibold text-white'>
                                            {load.referenceNumber || "Load"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='flex flex-1 flex-col justify-between'>
                                        <LoadCard
                                            load={load}
                                            onClick={() =>
                                                handleLoadClick(load)
                                            }
                                            onStatusUpdate={(loadId, status) =>
                                                handleStatusUpdate(
                                                    loadId,
                                                    status as LoadStatus
                                                )
                                            }
                                            isUpdating={updatingId === load.id}
                                        />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className='col-span-full py-10 text-center'>
                                <p className='text-muted-foreground'>
                                    No loads found.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>{" "}
                <TabsContent
                    value='pending'
                    className='mt-4'
                >
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {paginatedPendingLoads.length > 0 ? (
                            paginatedPendingLoads.map(load => (
                                <Card
                                    key={load.id}
                                    className='flex h-full flex-col border border-gray-700 bg-neutral-900 shadow-lg'
                                >
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='truncate text-lg font-semibold text-white'>
                                            {load.referenceNumber || "Load"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='flex flex-1 flex-col justify-between'>
                                        <LoadCard
                                            load={load}
                                            onClick={() =>
                                                handleLoadClick(load)
                                            }
                                            onStatusUpdate={(loadId, status) =>
                                                handleStatusUpdate(
                                                    loadId,
                                                    status as LoadStatus
                                                )
                                            }
                                            isUpdating={updatingId === load.id}
                                        />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className='col-span-full py-10 text-center'>
                                <p className='text-muted-foreground'>
                                    No pending loads found.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>{" "}
                <TabsContent
                    value='assigned'
                    className='mt-4'
                >
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {paginatedAssignedLoads.length > 0 ? (
                            paginatedAssignedLoads.map(load => (
                                <Card
                                    key={load.id}
                                    className='flex h-full flex-col border border-gray-700 bg-neutral-900 shadow-lg'
                                >
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='truncate text-lg font-semibold text-white'>
                                            {load.referenceNumber || "Load"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='flex flex-1 flex-col justify-between'>
                                        <LoadCard
                                            load={load}
                                            onClick={() =>
                                                handleLoadClick(load)
                                            }
                                            onStatusUpdate={(loadId, status) =>
                                                handleStatusUpdate(
                                                    loadId,
                                                    status as LoadStatus
                                                )
                                            }
                                            isUpdating={updatingId === load.id}
                                        />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className='col-span-full py-10 text-center'>
                                <p className='text-muted-foreground'>
                                    No assigned loads found.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>{" "}
                <TabsContent
                    value='in_transit'
                    className='mt-4'
                >
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {paginatedInTransitLoads.length > 0 ? (
                            paginatedInTransitLoads.map(load => (
                                <Card
                                    key={load.id}
                                    className='flex h-full flex-col border border-gray-700 bg-neutral-900 shadow-lg'
                                >
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='truncate text-lg font-semibold text-white'>
                                            {load.referenceNumber || "Load"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='flex flex-1 flex-col justify-between'>
                                        <LoadCard
                                            load={load}
                                            onClick={() =>
                                                handleLoadClick(load)
                                            }
                                            onStatusUpdate={(loadId, status) =>
                                                handleStatusUpdate(
                                                    loadId,
                                                    status as LoadStatus
                                                )
                                            }
                                            isUpdating={updatingId === load.id}
                                        />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className='col-span-full py-10 text-center'>
                                <p className='text-muted-foreground'>
                                    No in-transit loads found.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>{" "}
                <TabsContent
                    value='completed'
                    className='mt-4'
                >
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {paginatedCompletedLoads.length > 0 ? (
                            paginatedCompletedLoads.map(load => (
                                <Card
                                    key={load.id}
                                    className='flex h-full flex-col border border-gray-700 bg-neutral-900 shadow-lg'
                                >
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='truncate text-lg font-semibold text-white'>
                                            {load.referenceNumber || "Load"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='flex flex-1 flex-col justify-between'>
                                        <LoadCard
                                            load={load}
                                            onClick={() =>
                                                handleLoadClick(load)
                                            }
                                            onStatusUpdate={(loadId, status) =>
                                                handleStatusUpdate(
                                                    loadId,
                                                    status as LoadStatus
                                                )
                                            }
                                            isUpdating={updatingId === load.id}
                                        />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className='col-span-full py-10 text-center'>
                                <p className='text-muted-foreground'>
                                    No completed loads found.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
            {/* Load Form Dialog for New Load */}
            <Dialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
            >
                <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
                    <LoadForm
                        drivers={drivers}
                        vehicles={vehicles}
                        onClose={handleFormClose}
                    />
                </DialogContent>
            </Dialog>
            {/* Load Details Dialog for selected load */}
            {selectedLoad && (
                <LoadDetailsDialog
                    load={selectedLoad}
                    drivers={drivers}
                    vehicles={mappedVehicles}
                    isOpen={isDetailsOpen}
                    onClose={() => {
                        setIsDetailsOpen(false)
                        setSelectedLoad(null)
                    }}
                />
            )}
            {/* Filter Dialog */}
            <Dialog
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
            >
                <DialogContent className='max-w-md'>
                    <div className='space-y-4'>
                        <h3 className='text-lg font-semibold'>Filter Loads</h3>

                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='status-filter'>Status</Label>
                                <Select
                                    value={filters.status}
                                    onValueChange={value =>
                                        setFilters(prev => ({
                                            ...prev,
                                            status: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select status' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=''>
                                            All statuses
                                        </SelectItem>
                                        <SelectItem value='pending'>
                                            Pending
                                        </SelectItem>
                                        <SelectItem value='assigned'>
                                            Assigned
                                        </SelectItem>
                                        <SelectItem value='in_transit'>
                                            In Transit
                                        </SelectItem>
                                        <SelectItem value='completed'>
                                            Completed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='driver-filter'>Driver</Label>
                                <Select
                                    value={filters.driverId}
                                    onValueChange={value =>
                                        setFilters(prev => ({
                                            ...prev,
                                            driverId: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select driver' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=''>
                                            All drivers
                                        </SelectItem>
                                        {drivers.map(driver => (
                                            <SelectItem
                                                key={driver.id}
                                                value={driver.id}
                                            >
                                                {driver.firstName}{" "}
                                                {driver.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='origin-filter'>
                                    Origin State
                                </Label>
                                <Input
                                    id='origin-filter'
                                    placeholder='e.g., CA'
                                    value={filters.origin}
                                    onChange={e =>
                                        setFilters(prev => ({
                                            ...prev,
                                            originState: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='destination-filter'>
                                    Destination State
                                </Label>
                                <Input
                                    id='destination-filter'
                                    placeholder='e.g., TX'
                                    value={filters.destination}
                                    onChange={e =>
                                        setFilters(prev => ({
                                            ...prev,
                                            destinationState: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='date-filter'>Date Range</Label>
                                <Select
                                    value={filters.dateRange}
                                    onValueChange={value =>
                                        setFilters(prev => ({
                                            ...prev,
                                            dateRange: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select date range' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=''>
                                            All dates
                                        </SelectItem>
                                        <SelectItem value='recent'>
                                            Last 30 days
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='flex justify-end gap-2 pt-4'>
                            <Button
                                variant='outline'
                                onClick={resetFilters}
                            >
                                Reset
                            </Button>
                            <Button onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
