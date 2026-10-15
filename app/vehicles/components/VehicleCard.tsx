import type { Vehicle } from '@prisma/client';
import Link from 'next/link';

interface VehicleCardProps {
  vehicle: Vehicle;
}

/**
 * VehicleCard displays a summary of a vehicle's key information.
 * This is a server component (no interactive behavior on its own).
 */
export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link
      aria-label={`View vehicle ${vehicle.name ?? vehicle.vin}`}
      className="border-border bg-card hover:bg-muted/40 block rounded-md border p-4 shadow-sm transition-colors"
      href={`/vehicles/${vehicle.id}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{vehicle.name ?? 'Unnamed'}</p>
          <h2 className="text-lg font-medium">{vehicle.vin ?? 'No VIN'}</h2>
        </div>
        <span className="text-muted-foreground text-xs uppercase">{vehicle.status}</span>
      </div>
      <p className="text-muted-foreground text-sm">
        {vehicle.make ?? ''} {vehicle.model ?? ''}
        {vehicle.year ? ` · ${vehicle.year}` : ''}
      </p>
    </Link>
  );
}
