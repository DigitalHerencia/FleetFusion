import type { Route } from 'next';
import Link from 'next/link';

const footerLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy' },
] as const satisfies readonly { href: Route; label: string }[];

export function SharedFooter() {
  return (
    <footer className="border-border bg-background w-full border-t">
      <div className="container flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} FleetFusion. All rights reserved.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
