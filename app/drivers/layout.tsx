import './styles/modules.css';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Drivers | FleetFusion',
  description: 'Manage driver profiles and compliance.',
};

export default function DriversLayout({ children }: { children: ReactNode }) {
  return <div className="drivers-domain">{children}</div>;
}
