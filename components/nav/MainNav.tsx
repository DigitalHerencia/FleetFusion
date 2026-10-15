'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type OrganizationOption, OrgSwitcher } from '@/components/nav/OrgSwitcher';
import { UserMenu } from '@/components/nav/UserMenu';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'Help' },
] as const satisfies readonly { href: Route; label: string }[];

type MainNavProps = {
  organizations?: OrganizationOption[];
  currentOrganizationId?: string;
  onOrganizationChange?: (organizationId: string) => void;
};

export function MainNav({
  organizations,
  currentOrganizationId,
  onOrganizationChange,
}: MainNavProps) {
  const pathname = usePathname();

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex min-h-16 items-center gap-4">
        <Link
          className="shrink-0 text-lg font-bold tracking-tight"
          href="/dashboard"
          aria-label="FleetFusion dashboard"
        >
          FleetFusion
        </Link>
        <nav aria-label="Main" className="flex min-w-0 flex-1 items-center gap-1">
          {links.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'bg-accent text-accent-foreground rounded-md px-3 py-2 text-sm font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors'
                }
                href={href}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        {organizations !== undefined &&
          currentOrganizationId !== undefined &&
          onOrganizationChange !== undefined && (
            <OrgSwitcher
              organizations={organizations}
              currentOrganizationId={currentOrganizationId}
              onOrganizationChange={onOrganizationChange}
            />
          )}
        <UserMenu />
      </div>
    </header>
  );
}

export default MainNav;
