import type { ReactNode } from 'react';

import { PublicNav } from '@/components/navigation/PublicNav';
import { SharedFooter } from '@/components/shared/SharedFooter';

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="flex-1">{children}</main>
      <SharedFooter />
    </>
  );
}

export default MarketingLayout;
