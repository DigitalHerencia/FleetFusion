import type { Vehicle } from '@prisma/client';

interface VehicleCardProps {
  vehicle: Vehicle;
}

/**
 * VehicleCard displays a summary of a vehicle's key information.
 * This is a server component (no interactive behavior on its own).
 */
export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <article className="border-border bg-card rounded-md border p-4 shadow-sm">
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
    </article>
  );
}
