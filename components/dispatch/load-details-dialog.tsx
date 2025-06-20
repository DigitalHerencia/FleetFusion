/** @format */

"use client"

import type { LoadPriority, LoadStatus, LoadStatusEvent } from "@prisma/client"
import {
    Calendar,
    DollarSign,
    MapPin,
    Package,
    Route,
    Truck,
    User,
    Weight,
} from "lucide-react"
import Link from "next/link"
import { useState, type ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils/utils"
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
    Rate,
    TrackingUpdate,
} from "@/types/dispatch"

interface Driver {
    id: string
    firstName: string
    lastName: string
    status: string
}

interface Vehicle {
    make: ReactNode
    model: ReactNode
    id: string
    unitNumber: string
    status: string
    type: string
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

interface LoadDetailsDialogProps {
    load: Load
    drivers: Driver[]
    vehicles: Vehicle[]
    isOpen: boolean
    onClose: () => void
}

export function LoadDetailsDialog({
    load,
    drivers,
    vehicles,
    isOpen,
    onClose,
}: LoadDetailsDialogProps) {
    const [selectedDriverId, setSelectedDriverId] = useState(
        load.driver?.id || ""
    )
    const [selectedVehicleId, setSelectedVehicleId] = useState(
        load.vehicle?.id || ""
    )
    const [selectedTrailerId, setSelectedTrailerId] = useState(
        load.trailer?.id || ""
    )
    const [isAssigning, setIsAssigning] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "assigned":
                return "bg-blue-100 text-blue-800"
            case "in_transit":
                return "bg-indigo-100 text-indigo-800"
            case "completed":
                return "bg-green-100 text-green-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const tractors = vehicles.filter(
        vehicle => vehicle.type === "tractor" && vehicle.status === "active"
    )
    const trailers = vehicles.filter(
        vehicle => vehicle.type === "trailer" && vehicle.status === "active"
    )
    const activeDrivers = drivers.filter(driver => driver.status === "active")

    const handleAssign = async () => {
        setIsAssigning(true)
        // Simulate API call
        setTimeout(() => {
            setIsAssigning(false)
            onClose()
        }, 1000)
    }

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdatingStatus(true)
        // Simulate API call
        setTimeout(() => {
            setIsUpdatingStatus(false)
            onClose()
        }, 1000)
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={onClose}
        >
            <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-2xl'>
                <style>{`
          .select-menu-bg-fix [role='listbox'],
          .select-menu-bg-fix [data-radix-popper-content-wrapper],
          .select-menu-bg-fix .bg-popover,
          .select-menu-bg-fix .bg-background {
            background-color: #18181b !important;
            --tw-bg-opacity: 1 !important;
          }
        `}</style>
                <div className='select-menu-bg-fix'>
                    <DialogHeader>
                        <div className='flex items-center justify-between'>
                            <DialogTitle className='text-xl'>
                                Load {load.referenceNumber}
                            </DialogTitle>
                            <Badge className={getStatusColor(load.status)}>
                                {load.status.replace("_", " ")}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <Tabs
                        defaultValue='details'
                        className='w-full'
                    >
                        <TabsList className='grid w-full grid-cols-4'>
                            <TabsTrigger value='details'>Details</TabsTrigger>
                            <TabsTrigger value='assignment'>
                                Assignment
                            </TabsTrigger>
                            <TabsTrigger value='documents'>
                                Documents
                            </TabsTrigger>
                            <TabsTrigger value='history'>History</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value='details'
                            className='mt-4 space-y-4'
                        >
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                <Card>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-sm'>
                                            Customer Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='space-y-2'>
                                            <div>
                                                <Label className='text-xs'>
                                                    Customer Name
                                                </Label>
                                                <div className='font-medium'>
                                                    {load.customer.name}
                                                </div>
                                            </div>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <div>
                                                    <Label className='text-xs'>
                                                        Reference Number
                                                    </Label>
                                                    <div className='font-medium'>
                                                        {load.referenceNumber}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className='text-xs'>
                                                        Status
                                                    </Label>
                                                    <div>
                                                        <Badge
                                                            className={getStatusColor(
                                                                load.status
                                                            )}
                                                        >
                                                            {load.status.replace(
                                                                "_",
                                                                " "
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-sm'>
                                            Load Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='space-y-2'>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <div>
                                                    <Label className='flex items-center gap-1 text-xs'>
                                                        <Package className='h-3 w-3' />{" "}
                                                        Commodity
                                                    </Label>
                                                    <div className='font-medium'>
                                                        {load.cargo
                                                            ?.commodity ||
                                                            load.cargo
                                                                ?.description ||
                                                            "N/A"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className='flex items-center gap-1 text-xs'>
                                                        <Weight className='h-3 w-3' />{" "}
                                                        Weight
                                                    </Label>
                                                    <div className='font-medium'>
                                                        {load.cargo?.weight
                                                            ? `${load.cargo.weight.toLocaleString()} lbs`
                                                            : "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <div>
                                                    <Label className='flex items-center gap-1 text-xs'>
                                                        <DollarSign className='h-3 w-3' />{" "}
                                                        Rate
                                                    </Label>
                                                    <div className='font-medium'>
                                                        {/* FIX: Use the correct property from Rate, e.g., load.rate.rate */}
                                                        {load.rate &&
                                                        typeof load.rate ===
                                                            "number"
                                                            ? formatCurrency(
                                                                  load.rate
                                                              )
                                                            : "N/A"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className='flex items-center gap-1 text-xs'>
                                                        <Route className='h-3 w-3' />{" "}
                                                        Miles
                                                    </Label>
                                                    <div className='font-medium'>
                                                        {load.miles
                                                            ? load.miles.toLocaleString()
                                                            : "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-sm'>
                                            Origin
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='space-y-2'>
                                            <div className='flex items-start gap-2'>
                                                <MapPin className='text-muted-foreground mt-0.5 h-4 w-4' />
                                                <div>
                                                    <p className='font-medium'>
                                                        {load.origin}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='flex items-start gap-2'>
                                                <Calendar className='text-muted-foreground mt-0.5 h-4 w-4' />
                                                <div>
                                                    <p className='text-sm'>
                                                        Pickup Date
                                                    </p>
                                                    <p className='font-medium'>
                                                        {formatDate(
                                                            load.pickupDate
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-sm'>
                                            Destination
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='space-y-2'>
                                            <div className='flex items-start gap-2'>
                                                <MapPin className='text-muted-foreground mt-0.5 h-4 w-4' />
                                                <div>
                                                    <p className='font-medium'>
                                                        {load.destination}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='flex items-start gap-2'>
                                                <Calendar className='text-muted-foreground mt-0.5 h-4 w-4' />
                                                <div>
                                                    <p className='text-sm'>
                                                        Delivery Date
                                                    </p>
                                                    <p className='font-medium'>
                                                        {formatDate(
                                                            load.deliveryDate
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className='md:col-span-2'>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-sm'>
                                            Assignment
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                            <div>
                                                <Label className='flex items-center gap-1 text-xs'>
                                                    <User className='h-3 w-3' />{" "}
                                                    Driver
                                                </Label>
                                                <div className='font-medium'>
                                                    {load.driver
                                                        ? `${load.driver.name}`
                                                        : "Not Assigned"}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className='flex items-center gap-1 text-xs'>
                                                    <Truck className='h-3 w-3' />{" "}
                                                    Tractor
                                                </Label>
                                                <div className='font-medium'>
                                                    {load.vehicle
                                                        ? load.vehicle.unit
                                                        : "Not Assigned"}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className='flex items-center gap-1 text-xs'>
                                                    <Truck className='h-3 w-3' />{" "}
                                                    Trailer
                                                </Label>
                                                <div className='font-medium'>
                                                    {load.trailer
                                                        ? load.trailer.unit
                                                        : "Not Assigned"}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value='assignment'
                            className='mt-4 space-y-4'
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assign Resources</CardTitle>
                                    <CardDescription>
                                        Select a driver and equipment for this
                                        load
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='driver'>Driver</Label>
                                        <Select
                                            value={selectedDriverId}
                                            onValueChange={setSelectedDriverId}
                                        >
                                            <SelectTrigger id='driver'>
                                                <SelectValue placeholder='Select a driver' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='not_assigned'>
                                                    Not Assigned
                                                </SelectItem>
                                                {activeDrivers.map(driver => (
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
                                        <Label htmlFor='tractor'>Tractor</Label>
                                        <Select
                                            value={selectedVehicleId}
                                            onValueChange={setSelectedVehicleId}
                                        >
                                            <SelectTrigger id='tractor'>
                                                <SelectValue placeholder='Select a tractor' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='not_assigned'>
                                                    Not Assigned
                                                </SelectItem>
                                                {tractors.map(tractor => (
                                                    <SelectItem
                                                        key={tractor.id}
                                                        value={tractor.id}
                                                    >
                                                        {tractor.unitNumber} -{" "}
                                                        {tractor.make}{" "}
                                                        {tractor.model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='trailer'>Trailer</Label>
                                        <Select
                                            value={selectedTrailerId}
                                            onValueChange={setSelectedTrailerId}
                                        >
                                            <SelectTrigger id='trailer'>
                                                <SelectValue placeholder='Select a trailer' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='not_assigned'>
                                                    Not Assigned
                                                </SelectItem>
                                                {trailers.map(trailer => (
                                                    <SelectItem
                                                        key={trailer.id}
                                                        value={trailer.id}
                                                    >
                                                        {trailer.unitNumber} -{" "}
                                                        {trailer.make}{" "}
                                                        {trailer.model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent
                            value='documents'
                            className='mt-4 space-y-4'
                        ></TabsContent>

                        <TabsContent
                            value='history'
                            className='mt-4 space-y-4'
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Load History</CardTitle>
                                    <CardDescription>
                                        Track changes and updates to this load
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-4'>
                                        <div className='border-muted border-l-2 py-2 pl-4'>
                                            <p className='text-sm font-medium'>
                                                Load created
                                            </p>
                                            <p className='text-muted-foreground text-xs'>
                                                2025-05-01 09:30 AM
                                            </p>
                                        </div>
                                        <div className='border-muted border-l-2 py-2 pl-4'>
                                            <p className='text-sm font-medium'>
                                                Status changed to assigned
                                            </p>
                                            <p className='text-muted-foreground text-xs'>
                                                2025-05-01 10:15 AM
                                            </p>
                                        </div>
                                        <div className='border-muted border-l-2 py-2 pl-4'>
                                            <p className='text-sm font-medium'>
                                                Driver assigned: John Smith
                                            </p>
                                            <p className='text-muted-foreground text-xs'>
                                                2025-05-01 10:15 AM
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className='flex items-center justify-between'>
                        <div className='flex gap-2'>
                            <Button
                                variant='outline'
                                asChild
                            >
                                <Link href={`/dispatch/${load.id}/edit`}>
                                    Edit Load
                                </Link>
                            </Button>
                            <Button
                                variant='outline'
                                onClick={onClose}
                            >
                                Close
                            </Button>
                        </div>
                        <div className='flex gap-2'>
                            {load.status === "pending" && (
                                <Button
                                    onClick={handleAssign}
                                    disabled={isAssigning}
                                >
                                    {isAssigning
                                        ? "Assigning..."
                                        : "Assign Load"}
                                </Button>
                            )}
                            {load.status === "assigned" && (
                                <Button
                                    onClick={() =>
                                        handleStatusUpdate("in_transit")
                                    }
                                    disabled={isUpdatingStatus}
                                >
                                    {isUpdatingStatus
                                        ? "Updating..."
                                        : "Mark In Transit"}
                                </Button>
                            )}
                            {load.status === "in_transit" && (
                                <Button
                                    onClick={() =>
                                        handleStatusUpdate("completed")
                                    }
                                    disabled={isUpdatingStatus}
                                >
                                    {isUpdatingStatus
                                        ? "Updating..."
                                        : "Mark Completed"}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
