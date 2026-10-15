'use client';

import {
  Activity,
  Bell,
  ClipboardCheck,
  FileBarChart,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Truck,
  Users,
  WalletCards,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationLinks: readonly {
  href: Route;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dispatch', label: 'Dispatch', icon: Activity },
  { href: '/vehicles', label: 'Vehicles', icon: Truck },
  { href: '/drivers', label: 'Drivers', icon: Users },
  { href: '/compliance', label: 'Compliance', icon: ClipboardCheck },
  { href: '/ifta', label: 'IFTA', icon: WalletCards },
  { href: '/analytics', label: 'Analytics', icon: FileBarChart },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r md:block" aria-label="Fleet navigation">
        <nav className="sticky top-16 space-y-1 p-4" aria-label="Fleet management">
          {navigationLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'bg-accent text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors'
                }
                href={href}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <nav
        aria-label="Fleet management"
        className="border-border flex gap-1 overflow-x-auto border-b px-3 py-2 md:hidden"
      >
        {navigationLinks.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'bg-accent text-accent-foreground rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors'
              }
              href={href}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default SidebarNav;
