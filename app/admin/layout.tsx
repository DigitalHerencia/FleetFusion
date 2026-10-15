import './styles/modules.css';

import type { ReactNode } from 'react';

import { AdminHeader } from './components/AdminHeader';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-domain">
      <AdminHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-5 py-8">{children}</main>
    </div>
  );
}
