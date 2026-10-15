import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

const docsNavigation = [
  { href: '/docs', label: 'Documentation home' },
  { href: '/docs/overview', label: 'Overview' },
  { href: '/docs/user-docs', label: 'User guides' },
  { href: '/docs/product-guides', label: 'Product guides' },
  { href: '/docs/admin-guides', label: 'Admin guides' },
  { href: '/docs/reference', label: 'Reference' },
] as const satisfies readonly { href: Route; label: string }[];

export function DocsLayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1">
      <aside className="hidden w-64 shrink-0 border-r md:block" aria-label="Documentation">
        <nav className="sticky top-0 space-y-1 p-4" aria-label="Documentation navigation">
          <p className="text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wide uppercase">
            FleetFusion docs
          </p>
          {docsNavigation.map(({ href, label }) => (
            <Link
              key={href}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block rounded-md px-3 py-2 text-sm font-medium transition-colors"
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <nav
          aria-label="Documentation navigation"
          className="border-border mb-6 flex gap-1 overflow-x-auto border-b pb-2 md:hidden"
        >
          {docsNavigation.map(({ href, label }) => (
            <Link
              key={href}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </main>
    </div>
  );
}

export default DocsLayoutShell;
