import Link from 'next/link';

export function DriversHeader({ total = 0, active = 0 }: { total?: number; active?: number }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Fleet</p>
        <h1>Drivers</h1>
        <p>
          {active} active out of {total} profiles
        </p>
      </div>
      <Link href="/drivers/new">Add driver</Link>
    </header>
  );
}

export default DriversHeader;
