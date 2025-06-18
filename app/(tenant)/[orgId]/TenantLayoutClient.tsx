'use client';

import { useUserContext } from '@/components/auth/context';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { TopNavBar } from '@/components/shared/TopNavBar';
import { SidebarNav } from '@/components/shared/sidebar/SidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';
import type React from 'react';

interface TenantLayoutClientProps {
  orgId: string;
  children: React.ReactNode;
}

export function TenantLayoutClient({ orgId, children }: TenantLayoutClientProps) {
  const isMobile = useIsMobile();
  const userContext = useUserContext();
  const userId = userContext?.userId || '';

  const organization = userContext?.organizationMetadata
    ? { name: userContext.organizationMetadata.name || 'Organization' }
    : null;

  if (isMobile) {
    return (
      <div className='min-h-screen bg-gray-900'>
        <header className='fixed top-0 left-0 z-50 w-full border-b border-gray-700 bg-gray-800 shadow-lg'>
          <TopNavBar
            user={
              userContext
                ? {
                    name: userContext.name || '',
                    email: userContext.email || '',
                    profileImage: userContext.profileImage || '',
                  }
                : {
                    name: 'Guest',
                    email: 'guest@example.com',
                    profileImage: '',
                  }
            }
            organization={organization || { name: 'Guest Organization' }}
          />
        </header>
        <SidebarNav orgId={orgId} userId={userId} />
        <div className='pt-[64px] md:pl-64'>
          <main className='mx-auto w-full max-w-3xl p-4 md:p-8'>
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      <header className='fixed top-0 left-0 z-50 w-full border-b border-gray-700 bg-gray-800 shadow-lg'>
        <TopNavBar
          user={
            userContext
              ? {
                  name: userContext.name || '',
                  email: userContext.email || '',
                  profileImage: userContext.profileImage || '',
                }
              : {
                  name: 'Guest',
                  email: 'guest@example.com',
                  profileImage: '',
                }
          }
          organization={organization || { name: 'Guest Organization' }}
        />
      </header>
      <SidebarNav orgId={orgId} userId={userId} />
      <div className='pt-[64px] md:pl-64'>
        <main className='mx-auto w-full max-w-3xl p-4 md:p-8'>{children}</main>
      </div>
    </div>
  );
}
