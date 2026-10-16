"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createVehicle } from "@/lib/actions/fleetActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VehicleFormValues {
  unitNumber: string;
  type: "TRACTOR" | "TRAILER" | "STRAIGHT_TRUCK";
  status: "ACTIVE" | "IN_SHOP" | "OUT_OF_SERVICE" | "RETIRED";
  vin: string;
  plate: string;
  plateState: string;
  make: string;
  model: string;
  year: string;
}

export function VehicleForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<VehicleFormValues>({
    defaultValues: { unitNumber: "", type: "TRACTOR", status: "ACTIVE", vin: "", plate: "", plateState: "", make: "", model: "", year: "" },
  });
  return (
    <form className="mx-auto max-w-2xl space-y-5 surface-card p-5" onSubmit={handleSubmit(async (values) => {
      setError("");
      try {
        await createVehicle({ ...values, vin: values.vin || null, plate: values.plate || null, plateState: values.plateState || null, make: values.make || null, model: values.model || null, year: values.year ? Number(values.year) : null });
        router.push("/vehicles");
        router.refresh();
      } catch {
        setError("Vehicle could not be saved. Check the unit number, fields, and your fleet permissions.");
      }
    })}>
      <h1 className="type-title">Add vehicle</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="form-field"><Label htmlFor="vehicle-unit">Unit number</Label><Input id="vehicle-unit" required {...register("unitNumber")} /></div>
        <div className="form-field"><Label htmlFor="vehicle-type">Vehicle type</Label><select id="vehicle-type" className="control-field" {...register("type")}><option value="TRACTOR">Tractor</option><option value="TRAILER">Trailer</option><option value="STRAIGHT_TRUCK">Straight truck</option></select></div>
        <div className="form-field"><Label htmlFor="vehicle-status">Status</Label><select id="vehicle-status" className="control-field" {...register("status")}><option value="ACTIVE">Active</option><option value="IN_SHOP">In shop</option><option value="OUT_OF_SERVICE">Out of service</option><option value="RETIRED">Retired</option></select></div>
        <div className="form-field"><Label htmlFor="vehicle-vin">VIN</Label><Input id="vehicle-vin" {...register("vin")} /></div>
        <div className="form-field"><Label htmlFor="vehicle-plate">License plate</Label><Input id="vehicle-plate" {...register("plate")} /></div>
        <div className="form-field"><Label htmlFor="vehicle-plate-state">Plate state</Label><Input id="vehicle-plate-state" maxLength={2} {...register("plateState")} /></div>
        <div className="form-field"><Label htmlFor="vehicle-make">Make</Label><Input id="vehicle-make" {...register("make")} /></div>
        <div className="form-field"><Label htmlFor="vehicle-model">Model</Label><Input id="vehicle-model" {...register("model")} /></div>
        <div className="form-field"><Label htmlFor="vehicle-year">Year</Label><Input id="vehicle-year" type="number" min={1900} max={2200} {...register("year")} /></div>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save vehicle"}</Button>
    </form>
  );
}
