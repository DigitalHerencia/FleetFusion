import Link from 'next/link';

const items = [
  ['/settings', 'Overview'],
  ['/settings/organization', 'Organization'],
  ['/settings/users', 'Members'],
  ['/settings/billing', 'Billing'],
  ['/settings/feature-flags', 'Features'],
] as const;

export function SettingsMobile() {
  return (
    <nav
      aria-label="Settings sections"
      className="flex gap-2 overflow-x-auto border-b pb-4 md:hidden"
    >
      {items.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="rounded-full border px-3 py-1.5 text-sm whitespace-nowrap"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
