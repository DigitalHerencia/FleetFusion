import type { Route } from 'next';
import Link from 'next/link';

type NavigationLink = { href: string; label: string };

export function AdminMobile({ links }: { links: readonly NavigationLink[] }) {
  return (
    <nav
      aria-label="Mobile administration"
      className="flex gap-3 overflow-x-auto text-xs md:hidden"
    >
      {links.map((link) => (
        <Link className="whitespace-nowrap" href={link.href as Route} key={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
