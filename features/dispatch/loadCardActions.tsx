"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { advanceLoadStatus, assignLoad } from "@/lib/actions/dispatchActions";
import { Button } from "@/components/ui/button";
import type { LoadSummaryDTO } from "@/types/dispatchTypes";

interface DriverOption { id: string; firstName: string; lastName: string; status: string; }
interface VehicleOption { id: string; unitNumber: string; status: string; }

const nextStatuses: Partial<Record<LoadSummaryDTO["status"], Array<{ status: LoadSummaryDTO["status"]; label: string }>>> = {
  DRAFT: [{ status: "BOOKED", label: "Book load" }, { status: "CANCELED", label: "Cancel" }],
  BOOKED: [{ status: "DISPATCHED", label: "Dispatch" }, { status: "CANCELED", label: "Cancel" }],
  DISPATCHED: [{ status: "AT_PICKUP", label: "Arrived at pickup" }, { status: "BOOKED", label: "Return to booked" }, { status: "CANCELED", label: "Cancel" }],
  AT_PICKUP: [{ status: "IN_TRANSIT", label: "Depart pickup" }, { status: "CANCELED", label: "Cancel" }],
  IN_TRANSIT: [{ status: "AT_DELIVERY", label: "Arrived at delivery" }],
  AT_DELIVERY: [{ status: "DELIVERED", label: "Mark delivered" }],
};

export function LoadCardActions({
  load,
  drivers,
  vehicles,
}: {
  load: LoadSummaryDTO;
  drivers: DriverOption[];
  vehicles: VehicleOption[];
}) {
  const router = useRouter();
  const [driverId, setDriverId] = useState(load.driver?.id ?? "");
  const [vehicleId, setVehicleId] = useState(load.vehicle?.id ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const availableDrivers = drivers.filter((driver) => driver.status === "ACTIVE");
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "ACTIVE");
  const assignable = ["DRAFT", "BOOKED", "DISPATCHED"].includes(load.status);

  async function saveAssignment() {
    setBusy(true);
    setError("");
    try {
      await assignLoad({
        loadId: load.id,
        driverId: driverId || null,
        vehicleId: vehicleId || null,
        expectedVersion: load.version,
      });
      router.refresh();
    } catch {
      setError("Assignment was not saved. The load may have changed or the driver/truck is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: LoadSummaryDTO["status"]) {
    setBusy(true);
    setError("");
    try {
      await advanceLoadStatus({ loadId: load.id, status, expectedVersion: load.version });
      router.refresh();
    } catch {
      setError("Status was not changed. Check assignment requirements or reload the current record.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-foreground/15 pt-3">
      {assignable && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-bold uppercase">
            Driver
            <select className="control-field w-full" value={driverId} onChange={(event) => setDriverId(event.target.value)} disabled={busy}>
              <option value="">Unassigned</option>
              {availableDrivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs font-bold uppercase">
            Truck / vehicle
            <select className="control-field w-full" value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} disabled={busy}>
              <option value="">Unassigned</option>
              {availableVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>Unit {vehicle.unitNumber}</option>)}
            </select>
          </label>
          <div className="sm:col-span-2">
            <Button type="button" size="sm" variant="outline" disabled={busy || (driverId === (load.driver?.id ?? "") && vehicleId === (load.vehicle?.id ?? ""))} onClick={saveAssignment}>
              Save assignment
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {(nextStatuses[load.status] ?? []).map(({ status, label }) => (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={status === "CANCELED" ? "outline" : "default"}
            disabled={busy || (status === "DISPATCHED" && (!load.driver || !load.vehicle))}
            onClick={() => changeStatus(status)}
          >
            {label}
          </Button>
        ))}
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
