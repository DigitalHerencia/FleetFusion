import './styles/modules.css';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Dispatch | FleetFusion',
  description: 'Manage fleet loads and assignments.',
};

export default function DispatchLayout({ children }: { children: ReactNode }) {
  return <div className="dispatch-domain">{children}</div>;
}
