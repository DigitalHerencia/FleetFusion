import './styles/modules.css';

import type { ReactNode } from 'react';

import { AnalyticsHeader } from './components/AnalyticsHeader';

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="analytics-domain">
      <AnalyticsHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-5 py-8">{children}</main>
    </div>
  );
}
