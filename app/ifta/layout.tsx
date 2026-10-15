import Link from 'next/link';

export default function IftaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-full">
      <nav
        aria-label="IFTA navigation"
        className="flex flex-wrap items-center gap-4 border-b px-6 py-3 text-sm"
      >
        <Link className="font-medium hover:underline" href="/ifta">
          IFTA overview
        </Link>
        <Link className="hover:underline" href="/ifta/trips">
          Trips
        </Link>
        <Link className="hover:underline" href="/ifta/fuel">
          Fuel purchases
        </Link>
      </nav>
      {children}
    </div>
  );
}
