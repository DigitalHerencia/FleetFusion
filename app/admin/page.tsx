import Link from 'next/link';

import { DatabaseStatusCards } from './components/DatabaseStatusCards';
import { getAdminDashboardSnapshot } from './lib/adminFetchers';

export default async function AdminPage() {
  const snapshot = await getAdminDashboardSnapshot();
  return (
    <>
      <section>
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Administration
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">System overview</h1>
        <p className="text-muted-foreground mt-2">
          Manage organizations, access roles, system guidance, and database maintenance.
        </p>
      </section>
      <DatabaseStatusCards snapshot={snapshot} />
      <nav aria-label="Admin tools" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ['/admin/organizations', 'Organizations', 'Review and manage tenant accounts.'],
            [
              '/admin/roles',
              'Roles and permissions',
              'Maintain organization and system role grants.',
            ],
            ['/admin/documents', 'System documents', 'Manage central documentation and runbooks.'],
            [
              '/admin/database',
              'Database maintenance',
              'Inspect connectivity and refresh planner statistics.',
            ],
          ] as const
        ).map(([href, title, description]) => (
          <Link className="hover:bg-muted/40 rounded-lg border p-5" href={href} key={href}>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-2 text-sm">{description}</p>
          </Link>
        ))}
      </nav>
    </>
  );
}
