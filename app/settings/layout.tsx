import Link from 'next/link';
import type { ReactNode } from 'react';

import { SettingsMobile } from './components/SettingsMobile';

const links = [
  ['/settings', 'Overview'],
  ['/settings/organization', 'Organization profile'],
  ['/settings/users', 'Members and roles'],
  ['/settings/billing', 'Subscription'],
  ['/settings/feature-flags', 'Feature flags'],
] as const;

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full">
      <SettingsMobile />
      <div className="grid gap-8 py-5 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <nav aria-label="Settings sections" className="sticky top-6 grid gap-1">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm hover:bg-slate-100"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
