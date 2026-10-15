import Link from 'next/link';

import { AdminMobile } from './AdminMobile';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/organizations', label: 'Organizations' },
  { href: '/admin/roles', label: 'Roles' },
  { href: '/admin/documents', label: 'System documents' },
  { href: '/admin/database', label: 'Database' },
] as const;

export function AdminHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/admin" className="font-semibold tracking-tight">
          FleetFusion administration
        </Link>
        <nav aria-label="Administration" className="hidden gap-5 text-sm md:flex">
          {links.map((link) => (
            <Link
              className="text-muted-foreground hover:text-foreground"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <AdminMobile links={links} />
      </div>
    </header>
  );
}
