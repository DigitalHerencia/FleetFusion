"use client"

import { Button } from "@/components/ui/button"
import { MapPinned } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error with digest for Next.js 15 best practices
        if (process.env.NODE_ENV === "development") {
            // Log full error details in development
            console.error("[Auth Error Boundary]", error, error.digest)
        } else {
            // In production, log only digest to avoid leaking sensitive info
            console.error(
                `[Auth Error Boundary] Digest: ${error.digest ?? "unknown"}`
            )
        }
    }, [error])

    return (
        <div className='bg-background flex min-h-screen items-center justify-center'>
            <div className='flex flex-col items-center space-y-6'>
                <div className='flex flex-1 items-center'>
                    <Link
                        className='flex items-center justify-center underline-offset-4 hover:text-blue-500 hover:underline'
                        href='/'
                    >
                        <MapPinned className='mr-2 h-14 w-14 text-blue-500' />
                        <span className='text-6xl font-extrabold text-white dark:text-white'>
                            FleetFusion
                        </span>
                    </Link>
                </div>
                <span className='text-foreground text-2xl font-medium'>
                    Oops! Something went wrong.
                </span>
                <span className='text-muted-foreground max-w-md text-center text-base'>
                    We couldn't load this page. Please try refreshing, or
                    contact support if the problem persists.
                </span>
                {error.digest && (
                    <span className='text-xs text-gray-500'>
                        Error code: {error.digest}
                    </span>
                )}
                <Button
                    onClick={() => reset()}
                    className='mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                >
                    Try Again
                </Button>
            </div>
        </div>
    )
}
