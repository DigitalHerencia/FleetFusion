import Link from 'next/link';

export function AnalyticsHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link className="font-semibold tracking-tight" href="/analytics">
          Analytics
        </Link>
        <nav aria-label="Analytics" className="flex gap-5 text-sm">
          <Link className="text-muted-foreground hover:text-foreground" href="/analytics">
            Dashboard
          </Link>
          <Link className="text-muted-foreground hover:text-foreground" href="/analytics/reports">
            Reports
          </Link>
        </nav>
      </div>
    </header>
  );
}
