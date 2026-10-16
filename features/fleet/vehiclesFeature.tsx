import Link from "next/link";
import { PageHeaderBlock } from "@/components/blocks/application-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getVehicles } from "@/lib/fetchers/fleetFetchers";

export async function VehiclesFeature() {
  const vehicles = await getVehicles();
  return (
    <main className="container space-y-6 py-8">
      <PageHeaderBlock
        eyebrow="Fleet"
        title="Vehicles"
        description="Track power units, trailers, and equipment availability."
        action={{ label: "Add vehicle", href: "/vehicles/new" }}
      />
      <section className="grid gap-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="space-y-1">
                <h2 className="font-bold">Unit {vehicle.unitNumber}</h2>
                <p className="text-sm text-muted-foreground">{vehicle.type.replaceAll("_", " ")}{[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).length ? ` · ${[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ")}` : ""}</p>
                <p className="text-xs text-muted-foreground">{vehicle.plate ? `Plate ${vehicle.plate}${vehicle.plateState ? ` · ${vehicle.plateState}` : ""}` : "No plate recorded"}{vehicle.vin ? ` · VIN ${vehicle.vin}` : ""}</p>
              </div>
              <Badge variant={vehicle.status === "ACTIVE" ? "default" : "outline"}>{vehicle.status.replaceAll("_", " ")}</Badge>
            </CardContent>
          </Card>
        ))}
        {vehicles.length === 0 && (
          <Card><CardContent className="space-y-3 p-6">
            <p>No vehicles have been added to this organization.</p>
            <Button asChild><Link href="/vehicles/new">Add the first vehicle</Link></Button>
          </CardContent></Card>
        )}
      </section>
    </main>
  );
}
