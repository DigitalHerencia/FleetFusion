import Link from "next/link";
import { PageHeaderBlock } from "@/components/blocks/application-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDrivers } from "@/lib/fetchers/fleetFetchers";

export async function DriversFeature() {
  const drivers = await getDrivers();
  return (
    <main className="container space-y-6 py-8">
      <PageHeaderBlock
        eyebrow="Fleet"
        title="Drivers"
        description="Manage driver records and availability for dispatch."
        action={{ label: "Add driver", href: "/drivers/new" }}
      />
      <section className="grid gap-3">
        {drivers.map((driver) => (
          <Card key={driver.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="space-y-1">
                <h2 className="font-bold">{driver.firstName} {driver.lastName}</h2>
                <p className="text-sm text-muted-foreground">{driver.email ?? "No email"}{driver.phone ? ` · ${driver.phone}` : ""}</p>
                <p className="text-xs text-muted-foreground">Hired {driver.hiredAt ? driver.hiredAt.toLocaleDateString() : "date not recorded"}</p>
              </div>
              <Badge variant={driver.status === "ACTIVE" ? "default" : "outline"}>{driver.status.replaceAll("_", " ")}</Badge>
            </CardContent>
          </Card>
        ))}
        {drivers.length === 0 && (
          <Card><CardContent className="space-y-3 p-6">
            <p>No drivers have been added to this organization.</p>
            <Button asChild><Link href="/drivers/new">Add the first driver</Link></Button>
          </CardContent></Card>
        )}
      </section>
    </main>
  );
}
