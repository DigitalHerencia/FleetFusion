'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as iftaActions from '../lib/iftaActions';
import type { IftaTripInput } from '../schemas/compliance.schema';
import { iftaTripSchema } from '../schemas/compliance.schema';
import type { IftaTrip } from '../types';

interface IftaTripFormProps {
  vehicles: Array<{ id: string; name: string }>;
  initialData?: Partial<IftaTrip>;
}

function asTripAction(action: unknown) {
  return action as (input: IftaTripInput) => Promise<unknown>;
}

function dateTimeLocal(value?: Date | string | null) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function IftaTripForm({ vehicles, initialData }: IftaTripFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(initialData?.id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = iftaTripSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Review the trip details and try again.');
      return;
    }

    setIsSaving(true);
    try {
      const actions = iftaActions as typeof iftaActions & {
        updateTrip?: (input: IftaTripInput) => Promise<unknown>;
      };
      const action = initialData?.id ? actions.updateTrip : actions.createTrip;
      if (!action) throw new Error('Trip editing is not available yet.');
      await asTripAction(action)({
        ...parsed.data,
        ...(initialData?.id && { id: initialData.id }),
      });
      router.push('/ifta/trips');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this trip.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="max-w-2xl space-y-5 rounded-lg border p-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="tripNumber">Trip number</Label>
          <Input
            autoComplete="off"
            id="tripNumber"
            name="tripNumber"
            required
            defaultValue={initialData?.tripNumber ?? ''}
          />
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="vehicleId">Vehicle</Label>
          <select
            className="bg-background h-10 rounded-md border px-3"
            id="vehicleId"
            name="vehicleId"
            required
            defaultValue={initialData?.vehicleId ?? ''}
          >
            <option disabled value="">
              Select a vehicle
            </option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="startedAt">Trip start</Label>
          <Input
            id="startedAt"
            name="startedAt"
            required
            type="datetime-local"
            defaultValue={dateTimeLocal(initialData?.startedAt)}
          />
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="endedAt">Trip end</Label>
          <Input
            id="endedAt"
            name="endedAt"
            type="datetime-local"
            defaultValue={dateTimeLocal(initialData?.endedAt)}
          />
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="totalMiles">Total trip miles</Label>
          <Input
            id="totalMiles"
            min="0"
            name="totalMiles"
            required
            step="0.1"
            type="number"
            defaultValue={initialData?.totalMiles ?? ''}
          />
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="driverId">Driver ID (optional)</Label>
          <Input id="driverId" name="driverId" defaultValue={initialData?.driverId ?? ''} />
        </div>
      </div>
      <div className="grid gap-1.5 text-sm">
        <Label htmlFor="jurisdictionMiles">Miles by jurisdiction</Label>
        <textarea
          className="bg-background min-h-28 rounded-md border p-3 font-mono text-sm"
          id="jurisdictionMiles"
          name="jurisdictionMiles"
          placeholder={'{"TX": 1200, "OK": 300}'}
          required
          defaultValue={
            initialData?.jurisdictionMiles
              ? JSON.stringify(initialData.jurisdictionMiles, null, 2)
              : ''
          }
          aria-describedby="jurisdictionMilesHelp"
        />
        <span className="text-muted-foreground text-xs" id="jurisdictionMilesHelp">
          Enter miles driven in each state or province as JSON. These values must add up to total
          trip miles when both are provided.
        </span>
      </div>
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button disabled={isSaving || vehicles.length === 0} type="submit">
          {isSaving ? 'Saving…' : isEdit ? 'Save trip' : 'Record trip'}
        </Button>
        {vehicles.length === 0 && (
          <p className="text-muted-foreground self-center text-sm">
            Add a vehicle before recording a trip.
          </p>
        )}
      </div>
    </form>
  );
}
