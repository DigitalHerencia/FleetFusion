/** @format */

"use client"

<<<<<<< HEAD
import { useUserContext } from "@/components/auth/context"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { TopNavBar } from "@/components/shared/TopNavBar"
import { SidebarNav } from "@/components/shared/sidebar/SidebarNav"
import { useIsMobile } from "@/hooks/use-mobile"
import type React from "react"
=======
import type React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopNavBar } from '@/components/shared/TopNavBar';
import { SidebarNav } from '@/components/shared/sidebar/SidebarNav';
import { useUserContext } from '@/components/auth/context';
>>>>>>> origin/lrppos-codex/audit-sidebar-component-functionality

interface TenantLayoutProps {
    children: React.ReactNode
    params: { orgId: string }
}
/**
 * Client Component for Tenant Layout
 * Receives orgId from server component and uses auth context for userId
 */
<<<<<<< HEAD
export function TenantLayout({ children, params }: TenantLayoutProps) {
    const { orgId } = params
    const isMobile = useIsMobile()
    const userContext = useUserContext()
    const userId = userContext?.userId || ""
    // Prepare user and org data for TopNavBar
    const user = userContext
        ? {
              name: userContext.name || "Guest", // Ensure string fallback
              email: userContext.email,
              profileImage: userContext.profileImage || "",
          }
        : null
=======
export async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { orgId } = await params;
  const isMobile = useIsMobile();
  const userContext = useUserContext();
  const userId = userContext?.userId || '';
>>>>>>> origin/lrppos-codex/audit-sidebar-component-functionality

    const organization = userContext?.organizationMetadata
        ? {
              name: userContext.organizationMetadata.name || "Organization",
          }
        : null

    if (isMobile) {
        return (
            <div className='min-h-screen bg-gray-900'>
                <header className='fixed top-0 left-0 z-50 w-full border-b border-gray-700 bg-gray-800 shadow-lg'>
                    <TopNavBar
                        user={
                            user || {
                                name: "Guest",
                                email: "guest@example.com",
                                profileImage: "",
                            }
                        }
                        organization={
                            organization || { name: "Guest Organization" }
                        }
                    />
                </header>
                <SidebarNav
                    orgId={orgId}
                    userId={userId}
                />
                <div className='pt-[64px] md:pl-64'>
                    <main className='mx-auto w-full max-w-3xl p-4 md:p-8'>
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                </div>
            </div>
        )
    }

    return (
<<<<<<< HEAD
        <div className='min-h-screen bg-neutral-900'>
            <header className='fixed top-0 left-0 z-50 w-full'>
                <TopNavBar
                    user={
                        user || {
                            name: "Guest",
                            email: "guest@example.com",
                            profileImage: "",
                        }
                    }
                    organization={
                        organization || { name: "Guest Organization" }
                    }
                />
            </header>
            <SidebarNav
                orgId={orgId}
                userId={userId}
            />
            <div className='flex min-w-0 flex-1 flex-col pt-16 md:pl-64'>
                <main className='flex-1'>
                    <ErrorBoundary>{children}</ErrorBoundary>
                </main>
            </div>
        </div>
    )
=======
      <div className="min-h-screen bg-gray-900">
        <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-700 bg-gray-800 shadow-lg">
          <TopNavBar
            user={user || { name: 'Guest', email: 'guest@example.com', profileImage: '' }}
            organization={organization || { name: 'Guest Organization' }}
          />
        </header>
        <SidebarNav orgId={orgId} userId={userId} />
        <div className="pt-[64px] md:pl-64">
          <main className="mx-auto w-full max-w-3xl p-4 md:p-8">{children}</main>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="fixed top-0 left-0 z-50 w-full">
        <TopNavBar
          user={user || { name: 'Guest', email: 'guest@example.com', profileImage: '' }}
          organization={organization || { name: 'Guest Organization' }}
        />
      </header>
      <SidebarNav orgId={orgId} userId={userId} />
      <div className="flex min-w-0 flex-1 flex-col pt-16 md:pl-64">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
>>>>>>> origin/lrppos-codex/audit-sidebar-component-functionality
}
