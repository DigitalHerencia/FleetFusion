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
      <span className="text-muted-foreground text-sm">Total: {total}</span>
    </header>
  );
}
