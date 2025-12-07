import { getVehicles } from './lib/vehiclesFetchers';

export default async function VehiclesPage() {
  const vehicles = await getVehicles({ page: 1, pageSize: 50 });

  return (
    <main className="space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Fleet</p>
          <h1 className="text-2xl font-semibold">Vehicles</h1>
        </div>
        <span className="text-muted-foreground text-sm">Total: {vehicles.length}</span>
      </header>
      <section className="grid gap-3">
        {vehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className="border-border bg-card rounded-md border p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{vehicle.name ?? 'Unnamed'}</p>
                <h2 className="text-lg font-medium">{vehicle.vin ?? 'No VIN'}</h2>
              </div>
              <span className="text-muted-foreground text-xs uppercase">{vehicle.status}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {vehicle.make} {vehicle.model} · {vehicle.year}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
