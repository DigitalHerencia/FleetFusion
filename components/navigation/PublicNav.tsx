import { Show, UserButton } from '@clerk/nextjs';
import type { Route } from 'next';
import Link from 'next/link';

const navigationLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
] as const satisfies readonly { href: Route; label: string }[];

export function PublicNav() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
        <Link className="text-xl font-bold tracking-tight" href="/" aria-label="FleetFusion home">
          FleetFusion
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {navigationLinks.map(({ href, label }) => (
            <Link
              key={href}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
              href={href}
            >
              {label}
            </Link>
          ))}
          <Show when="signed-out">
            <Link
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
              href={'/sign-in' as Route}
            >
              Sign in
            </Link>
            <Link
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm font-semibold transition-colors"
              href={'/sign-up' as Route}
            >
              Get started
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
