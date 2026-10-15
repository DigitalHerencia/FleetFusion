import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthLayoutShell({
  children,
  title = 'Welcome to FleetFusion',
  description,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Link className="text-muted-foreground text-sm font-semibold" href="/">
            FleetFusion
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {children}
      </section>
    </main>
  );
}

export default AuthLayoutShell;
