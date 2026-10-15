import Link from 'next/link';

export function IftaMobile() {
  return (
    <nav aria-label="IFTA quick navigation" className="grid grid-cols-3 gap-2 sm:hidden">
      <Link className="rounded-md border px-3 py-2 text-center text-sm" href="/ifta">
        Overview
      </Link>
      <Link className="rounded-md border px-3 py-2 text-center text-sm" href="/ifta/trips">
        Trips
      </Link>
      <Link className="rounded-md border px-3 py-2 text-center text-sm" href="/ifta/fuel">
        Fuel
      </Link>
    </nav>
  );
}
