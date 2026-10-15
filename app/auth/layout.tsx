import type { ReactNode } from 'react';

import { AuthHeader } from './components/AuthHeader';
import { AuthMobile } from './components/AuthMobile';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />
      <AuthMobile />
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
