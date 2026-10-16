import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

const navigationLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dispatch', label: 'Dispatch' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/compliance', label: 'Compliance' },
  { href: '/crm/accounts', label: 'Customers' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/expenses', label: 'Expenses' },
] as const satisfies readonly { href: Route; label: string }[];

export function TenantShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="container flex min-h-14 items-center gap-6">
          <Link className="shrink-0 text-lg font-bold tracking-tight" href="/dashboard">
            FleetFusion
          </Link>
          <nav
            aria-label="Fleet management"
            className="flex min-w-0 items-center gap-1 overflow-x-auto"
          >
            {navigationLinks.map(({ href, label }) => (
              <Link
                key={href}
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
                href={href}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
