import Link from 'next/link';

interface VehiclesHeaderProps {
  total: number;
}

/**
 * VehiclesHeader displays the page title and total count of vehicles.
 */
export function VehiclesHeader({ total }: VehiclesHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-muted-foreground text-sm">Fleet</p>
        <h1 className="text-2xl font-semibold">Vehicles</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm">Showing: {total}</span>
        <Link
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm"
          href="/vehicles/new"
        >
          Add vehicle
        </Link>
      </div>
    </header>
  );
}
