import './styles/modules.css';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Dashboard | FleetFusion',
  description: 'Fleet performance and operational dashboard.',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="dashboard-domain">{children}</div>;
}
