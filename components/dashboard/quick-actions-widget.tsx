/** @format */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertTriangle,
    BarChart3,
    CalendarClock,
    FileText,
    PlusCircle,
    Truck,
    Users,
    Zap,
} from "lucide-react"
import Link from "next/link"

interface QuickAction {
    id: string
    title: string
    description: string
    href: string
    icon: string
    color: string
    enabled: boolean
}

interface QuickActionsWidgetProps {
    orgId: string
    actions?: QuickAction[]
}

const iconMap = {
    PlusCircle,
    CalendarClock,
    AlertTriangle,
    Truck,
    Users,
    FileText,
    BarChart3,
    Zap,
} as const

const colorMap = {
    "bg-green-500": "bg-green-500 hover:bg-green-600 text-white",
    "bg-blue-500": "bg-blue-500 hover:bg-blue-600 text-white",
    "bg-orange-500": "bg-orange-500 hover:bg-orange-600 text-white",
    "bg-purple-500": "bg-purple-500 hover:bg-purple-600 text-white",
    "bg-red-500": "bg-red-500 hover:bg-red-600 text-white",
    "bg-indigo-500": "bg-indigo-500 hover:bg-indigo-600 text-white",
} as const

// Default actions for MVP
const defaultActions: QuickAction[] = [
    {
        id: "create-load",
        title: "Create New Load",
        description: "Add a new load to dispatch",
        href: "/[orgId]/dispatch/loads/new",
        icon: "PlusCircle",
        color: "bg-green-500",
        enabled: true,
    },
    {
        id: "schedule-maintenance",
        title: "Schedule Maintenance",
        description: "Plan vehicle maintenance",
        href: "/[orgId]/maintenance/schedule/new",
        icon: "CalendarClock",
        color: "bg-blue-500",
        enabled: true,
    },
    {
        id: "view-alerts",
        title: "View Alerts",
        description: "Check compliance alerts",
        href: "/[orgId]/compliance/alerts",
        icon: "AlertTriangle",
        color: "bg-orange-500",
        enabled: true,
    },
    {
        id: "add-vehicle",
        title: "Add Vehicle",
        description: "Register new vehicle",
        href: "/[orgId]/vehicles/new",
        icon: "Truck",
        color: "bg-purple-500",
        enabled: true,
    },
    {
        id: "add-driver",
        title: "Add Driver",
        description: "Onboard new driver",
        href: "/[orgId]/drivers/new",
        icon: "Users",
        color: "bg-indigo-500",
        enabled: true,
    },
    {
        id: "view-reports",
        title: "View Reports",
        description: "Access analytics",
        href: "/[orgId]/analytics/reports",
        icon: "BarChart3",
        color: "bg-red-500",
        enabled: true,
    },
]

export default function QuickActionsWidget({
    orgId,
    actions = defaultActions,
}: QuickActionsWidgetProps) {
    const enabledActions = actions.filter(action => action.enabled)

    return (
        <Card className='h-fit'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    <Zap className='h-4 w-4 text-yellow-500' />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {enabledActions.map(action => {
                    const Icon = iconMap[action.icon as keyof typeof iconMap]
                    return (
                        <Link
                            key={action.id}
                            href={action.href.replace("[orgId]", orgId)}
                            passHref
                        >
                            <Button
                                className={`w-full flex flex-col items-start p-4 h-auto rounded-lg shadow-md ${
                                    colorMap[
                                        action.color as keyof typeof colorMap
                                    ]
                                }`}
                                variant='ghost'
                            >
                                <div className='flex items-center gap-3'>
                                    <Icon className='h-6 w-6' />
                                    <span className='font-semibold'>
                                        {action.title}
                                    </span>
                                </div>
                                <span className='text-xs text-white/80 mt-1'>
                                    {action.description}
                                </span>
                            </Button>
                        </Link>
                    )
                })}
            </CardContent>
        </Card>
    )
}
