'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createVehicle, updateVehicle } from '../lib/vehiclesActions';
import type { VehicleInput } from '../schemas/vehicles.schema';

interface VehicleFormProps {
  initialData?: Partial<VehicleInput>;
}

/**
 * VehicleForm component for creating or editing a vehicle.
 * Uses Next.js server actions for submission.
 */
export function VehicleForm({ initialData }: VehicleFormProps) {
  const isEdit = Boolean(initialData?.id);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      if (isEdit && initialData?.id) {
        // Include the vehicle id when updating
        await updateVehicle({ ...data, id: initialData.id });
      } else {
        await createVehicle(data);
      }
      // If successful, router will redirect via server action; optionally, we can refresh
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to save vehicle');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Vehicle' : 'New Vehicle'}</h1>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Unit Number / Name</Label>
          <Input id="name" name="name" defaultValue={initialData?.name ?? ''} required />
        </div>
        <div className="col-span-2">
          <Label htmlFor="vin">VIN</Label>
          <Input id="vin" name="vin" defaultValue={initialData?.vin ?? ''} required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={initialData?.type ?? 'TRACTOR'}
            className="block w-full rounded-md border"
          >
            <option value="TRACTOR">Tractor</option>
            <option value="TRAILER">Trailer</option>
            <option value="STRAIGHT_TRUCK">Straight Truck</option>
            <option value="SERVICE_VEHICLE">Service Vehicle</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status ?? 'ACTIVE'}
            className="block w-full rounded-md border"
          >
            <option value="ACTIVE">Active</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
            <option value="SOLD">Sold</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            defaultValue={initialData?.year ?? ''}
            min={1886}
            max={new Date().getFullYear() + 5}
          />
        </div>
        <div>
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" defaultValue={initialData?.make ?? ''} />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" defaultValue={initialData?.model ?? ''} />
        </div>
        <div>
          <Label htmlFor="plateNumber">Plate Number</Label>
          <Input
            id="plateNumber"
            name="plateNumber"
            defaultValue={initialData?.plateNumber ?? ''}
          />
        </div>
        <div>
          <Label htmlFor="plateState">Plate State</Label>
          <Input
            id="plateState"
            name="plateState"
            placeholder="e.g. CA"
            defaultValue={initialData?.plateState ?? ''}
          />
        </div>
        <div>
          <Label htmlFor="odometer">Odometer</Label>
          <Input
            id="odometer"
            name="odometer"
            type="number"
            min={0}
            defaultValue={initialData?.odometer ?? ''}
          />
        </div>
        <div>
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Input
            id="fuelType"
            name="fuelType"
            placeholder="Diesel, Gasoline, etc."
            defaultValue={initialData?.fuelType ?? ''}
          />
        </div>
        <div>
          <Label htmlFor="axleCount">Axle Count</Label>
          <Input
            id="axleCount"
            name="axleCount"
            type="number"
            min={0}
            defaultValue={initialData?.axleCount ?? ''}
          />
        </div>
      </div>
      <Button type="submit">{isEdit ? 'Save Changes' : 'Create Vehicle'}</Button>
    </form>
  );
}
