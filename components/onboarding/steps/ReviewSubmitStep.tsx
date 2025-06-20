/** @format */

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ArrowLeft,
    Building,
    CheckCircle,
    Crown,
    Rocket,
    Sparkles,
    User,
    Users,
} from "lucide-react"
import type { OnboardingFormData } from "../OnboardingStepper"

interface ReviewSubmitStepProps {
    formData: OnboardingFormData
    isAdmin: boolean
    onSubmit: () => void
    onPrev: () => void
    isLoading: boolean
}

export function ReviewSubmitStep({
    formData,
    isAdmin,
    onSubmit,
    onPrev,
    isLoading,
}: ReviewSubmitStepProps) {
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-purple-900/30 text-purple-300 border-purple-700/30"
            case "dispatcher":
                return "bg-blue-900/30 text-blue-300 border-blue-700/30"
            case "driver":
                return "bg-green-900/30 text-green-300 border-green-700/30"
            case "compliance_officer":
                return "bg-orange-900/30 text-orange-300 border-orange-700/30"
            case "accountant":
                return "bg-teal-900/30 text-teal-300 border-teal-700/30"
            default:
                return "bg-neutral-800 text-gray-300 border-neutral-700"
        }
    }

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case "admin":
                return "Admin / Owner"
            case "dispatcher":
                return "Dispatcher"
            case "driver":
                return "Driver"
            case "compliance_officer":
                return "Compliance Officer"
            case "accountant":
                return "Accountant"
            case "viewer":
                return "Viewer"
            default:
                return role
        }
    }

    return (
        <div className='space-y-6'>
            {" "}
            <div className='text-center'>
                <div className='mx-auto w-12 h-12 bg-green-900/30 border border-green-700/30 rounded-full flex items-center justify-center mb-4'>
                    <CheckCircle className='h-6 w-6 text-green-400' />
                </div>
                <h2 className='text-2xl font-bold text-white mb-2'>
                    Almost there! 🎉
                </h2>
                <p className='text-gray-300'>
                    Please review your information before we complete your
                    setup.
                </p>
            </div>
            <div className='max-w-2xl mx-auto space-y-4'>
                {" "}
                {/* Personal Information */}
                <Card className='bg-neutral-800 border-neutral-700'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2 text-lg text-white'>
                            <User className='h-5 w-5' />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                        <div className='flex justify-between'>
                            <span className='text-gray-400'>Name:</span>
                            <span className='font-medium text-white'>
                                {formData.firstName} {formData.lastName}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-gray-400'>Email:</span>
                            <span className='font-medium text-white'>
                                {formData.email}
                            </span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-400'>Role:</span>
                            <Badge className={getRoleBadgeColor(formData.role)}>
                                {getRoleDisplayName(formData.role)}
                                {formData.role === "admin" && (
                                    <Crown className='ml-1 h-3 w-3' />
                                )}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>{" "}
                {/* Company Information (Admin only) */}
                {isAdmin && (
                    <Card className='bg-neutral-800 border-neutral-700'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-lg text-white'>
                                <Building className='h-5 w-5' />
                                Company Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <div className='flex justify-between'>
                                <span className='text-gray-400'>
                                    Company Name:
                                </span>
                                <span className='font-medium text-white'>
                                    {formData.companyName}
                                </span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-gray-400'>Address:</span>
                                <span className='font-medium text-right text-white'>
                                    {formData.address}
                                    <br />
                                    {formData.city}, {formData.state}{" "}
                                    {formData.zip}
                                </span>
                            </div>
                            {formData.phone && (
                                <div className='flex justify-between'>
                                    <span className='text-gray-400'>
                                        Phone:
                                    </span>
                                    <span className='font-medium text-white'>
                                        {formData.phone}
                                    </span>
                                </div>
                            )}
                            {formData.dotNumber && (
                                <div className='flex justify-between'>
                                    <span className='text-gray-400'>
                                        DOT Number:
                                    </span>
                                    <span className='font-medium text-white'>
                                        {formData.dotNumber}
                                    </span>
                                </div>
                            )}
                            {formData.mcNumber && (
                                <div className='flex justify-between'>
                                    <span className='text-gray-400'>
                                        MC Number:
                                    </span>
                                    <span className='font-medium text-white'>
                                        {formData.mcNumber}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}{" "}
                {/* Organization Join (Employee only) */}
                {!isAdmin && (
                    <Card className='bg-neutral-800 border-neutral-700'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-lg text-white'>
                                <Users className='h-5 w-5' />
                                Organization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <div className='flex justify-between'>
                                <span className='text-gray-400'>
                                    Organization ID:
                                </span>
                                <span className='font-medium text-white'>
                                    {formData.organizationId}
                                </span>
                            </div>
                            {formData.inviteCode && (
                                <div className='flex justify-between'>
                                    <span className='text-gray-400'>
                                        Invite Code:
                                    </span>
                                    <span className='font-medium text-white'>
                                        {formData.inviteCode}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}{" "}
                {/* What's Next */}
                <Card className='bg-gradient-to-r from-neutral-800 to-neutral-700 border-neutral-600'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2 text-lg text-white'>
                            <Sparkles className='h-5 w-5 text-yellow-400' />
                            What happens next?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2 text-sm text-gray-300'>
                            {isAdmin ? (
                                <>
                                    <p className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-600' />
                                        Your organization will be created
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-600' />
                                        You'll get full admin access to manage
                                        everything
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-600' />
                                        You can invite team members from
                                        Settings
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-600' />
                                        Add vehicles, drivers, and start
                                        managing loads
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-600' />
                                        You'll join your organization
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-600' />
                                        Access will be configured based on your
                                        role
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-600' />
                                        You'll see your personalized dashboard
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-600' />
                                        Start collaborating with your team
                                    </p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>{" "}
                {/* Fun Message */}
                <div className='text-center p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-800/50'>
                    <p className='text-yellow-400 font-medium'>
                        🌴 While we can't offer that trip to Tahiti...
                    </p>
                    <p className='text-yellow-300 text-sm mt-1'>
                        ...we promise your new dashboard is going to be pretty
                        awesome!
                    </p>
                </div>
            </div>{" "}
            <div className='flex flex-col gap-3 pt-4 max-w-md mx-auto'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onPrev}
                    className='w-full border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700 hover:border-neutral-500'
                    disabled={isLoading}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>
                <Button
                    onClick={onSubmit}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg'
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2' />
                            Setting up...
                        </>
                    ) : (
                        <>
                            Complete Setup
                            <Rocket className='ml-2 h-4 w-4' />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
