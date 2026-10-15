'use client';

import type { ReactNode } from 'react';

export function DashboardOptimistic({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-optimistic" aria-live="polite">
      {children}
    </div>
  );
}

export default DashboardOptimistic;
