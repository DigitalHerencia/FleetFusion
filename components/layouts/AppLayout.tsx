import type { ReactNode } from 'react';

import { MainNav } from '@/components/nav/MainNav';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MainNav />
      <main className="min-h-0 flex-1">{children}</main>
    </>
  );
}

export default AppLayout;
