/** @format */

"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { SystemRole } from "@/types/abac"
import { SystemRoles } from "@/types/abac"
import {
    ArrowLeft,
    ArrowRight,
    ClipboardCheck,
    Crown,
    Radio,
    Truck,
    UserCog,
    Users,
} from "lucide-react"
import React from "react"
import type { OnboardingFormData } from "../OnboardingStepper"

interface RoleSelectionStepProps {
    formData: OnboardingFormData
    updateFormData: (updates: Partial<OnboardingFormData>) => void
    onNext: () => void
    onPrev: () => void
}

const roleOptions = [
    {
        value: SystemRoles.ADMIN,
        label: "Admin / Owner",
        description: "Full access to manage the company and all operations",
        icon: Crown,
        color: "text-purple-400 bg-purple-900/30",
    },
    {
        value: SystemRoles.DISPATCHER,
        label: "Dispatcher",
        description: "Manage loads, assign drivers, coordinate operations",
        icon: Radio,
        color: "text-blue-400 bg-blue-900/30",
    },
    {
        value: SystemRoles.DRIVER,
        label: "Driver",
        description: "View assigned loads, update status, log hours",
        icon: Truck,
        color: "text-green-400 bg-green-900/30",
    },
    {
        value: SystemRoles.COMPLIANCE,
        label: "Compliance Officer",
        description: "Manage compliance documents, audit logs, safety records",
        icon: ClipboardCheck,
        color: "text-orange-400 bg-orange-900/30",
    },
    {
        value: SystemRoles.MEMBER,
        label: "Member / Employee",
        description: "Basic access to view organization information",
        icon: UserCog,
        color: "text-teal-400 bg-teal-900/30",
    },
]

export function RoleSelectionStep({
    formData,
    updateFormData,
    onNext,
    onPrev,
}: RoleSelectionStepProps) {
    const selectedRole = roleOptions.find(role => role.value === formData.role)
    const isValid = formData.role !== ""

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isValid) {
            onNext()
        }
    }
    return (
        <div className='space-y-6'>
            <div className='text-center'>
                <div className='mx-auto w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-4'>
                    <Users className='h-6 w-6 text-blue-500' />
                </div>
                <h2 className='text-2xl font-bold text-white mb-2'>
                    What's your role?
                </h2>
                <p className='text-gray-400'>
                    This helps us customize your experience and set the right
                    permissions.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className='space-y-6 max-w-2xl mx-auto'
            >
                <div className='space-y-2'>
                    <Label
                        htmlFor='role'
                        className='text-sm font-medium text-gray-200'
                    >
                        Select Your Role
                    </Label>
                    <Select
                        value={formData.role}
                        onValueChange={(value: SystemRole) =>
                            updateFormData({ role: value })
                        }
                    >
                        <SelectTrigger className='w-full bg-black border-neutral-700 text-white focus:ring-2 focus:ring-blue-500'>
                            <SelectValue placeholder='Choose your role in the organization' />
                        </SelectTrigger>
                        <SelectContent className='bg-neutral-900 border-neutral-700'>
                            {roleOptions.map(role => {
                                const Icon = role.icon
                                return (
                                    <SelectItem
                                        key={role.value}
                                        value={role.value}
                                        className='text-white hover:bg-neutral-800 focus:bg-neutral-800'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <div
                                                className={`p-1 rounded ${role.color}`}
                                            >
                                                <Icon className='h-4 w-4' />
                                            </div>
                                            <div>
                                                <div className='font-medium'>
                                                    {role.label}
                                                </div>
                                                <div className='text-sm text-gray-400'>
                                                    {role.description}
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>
                {/* Role Preview */}
                {selectedRole && (
                    <div className='p-4 border border-neutral-700 rounded-lg bg-neutral-800'>
                        <div className='flex items-start gap-3'>
                            <div
                                className={`p-2 rounded-lg ${selectedRole.color}`}
                            >
                                <selectedRole.icon className='h-5 w-5' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-white'>
                                    {selectedRole.label}
                                </h3>
                                <p className='text-sm text-gray-400 mt-1'>
                                    {selectedRole.description}
                                </p>

                                {formData.role === SystemRoles.ADMIN && (
                                    <div className='mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-700/30'>
                                        <p className='text-sm text-purple-300 font-medium'>
                                            👑 Admin Path Ahead!
                                        </p>
                                        <p className='text-xs text-purple-400 mt-1'>
                                            As an admin, you'll set up your
                                            company information, DOT numbers,
                                            and initial settings.
                                        </p>
                                    </div>
                                )}

                                {formData.role !== SystemRoles.ADMIN &&
                                    formData.role !== "" && (
                                        <div className='mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30'>
                                            <p className='text-sm text-blue-300 font-medium'>
                                                🎯 Employee Path
                                            </p>
                                            <p className='text-xs text-blue-400 mt-1'>
                                                You'll need an organization ID
                                                from your admin to join your
                                                company.
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}{" "}
                <div className='flex flex-col gap-3 pt-4'>
                    <Button
                        type='submit'
                        className='w-full bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        disabled={!isValid}
                    >
                        Continue
                        <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onPrev}
                        className='w-full border-neutral-700 bg-neutral-800 text-gray-200 hover:bg-neutral-700 hover:text-white'
                    >
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back
                    </Button>
                </div>
            </form>
        </div>
    )
}
