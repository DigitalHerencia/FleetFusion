import type { ReactNode } from 'react';

import { AppLayout } from '@/components/layouts/AppLayout';
import { SidebarNav } from '@/components/nav/SidebarNav';

export function DashboardLayoutShell({ children }: { children: ReactNode }) {
  return (
    <AppLayout>
      <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1">
        <SidebarNav />
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </AppLayout>
  );
}

export default DashboardLayoutShell;
