import type React from "react"

import "@/app/globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
// Import Next.js font utilities
import { Inter, Playfair_Display } from "next/font/google"

import { AuthProvider } from "@/components/auth/context"
import { ThemeProvider } from "@/components/shared/ThemeProvider"

// Choose Inter for body (clean, modern, highly readable)
// Choose Playfair Display for headers (elegant, strong contrast)
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
})
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
})

export const metadata: Metadata = {
    title: "FleetFusion - Enterprise-Grade Fleet Management",
    description:
        "Modern transportation management system for small-to-mid-size trucking fleets",
    icons: "/map-pinned_icon.png",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html
                lang='en'
                className={`dark ${inter.variable} ${playfair.variable}`}
                suppressHydrationWarning
            >
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body className='bg-black font-sans text-white'>
                    <ThemeProvider
                        attribute='class'
                        defaultTheme='dark'
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <AuthProvider>
                            {/*
                Navigation is now handled in feature layouts (e.g., /dashboard/layout.tsx) or per-page as needed.
                Do not render MobileNav or PublicNav globally here.
              */}
                            {children}
                        </AuthProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
