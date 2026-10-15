'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as iftaActions from '../lib/iftaActions';
import type { IftaFuelInput } from '../schemas/compliance.schema';
import { iftaFuelSchema } from '../schemas/compliance.schema';
import type { IftaFuelPurchase } from '../types';

interface IftaFuelFormProps {
  vehicles: Array<{ id: string; name: string }>;
  initialData?: Partial<IftaFuelPurchase>;
}

function asFuelAction(action: unknown) {
  return action as (input: IftaFuelInput) => Promise<unknown>;
}

function dateValue(value?: Date | string) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function IftaFuelForm({ vehicles, initialData }: IftaFuelFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(initialData?.id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = iftaFuelSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Review the purchase details and try again.');
      return;
    }

    setIsSaving(true);
    try {
      const actions = iftaActions as typeof iftaActions & {
        updateFuelPurchase?: (input: IftaFuelInput) => Promise<unknown>;
      };
      const action = initialData?.id ? actions.updateFuelPurchase : actions.addFuelPurchase;
      if (!action) throw new Error('Fuel purchase editing is not available yet.');
      await asFuelAction(action)({
        ...parsed.data,
        ...(initialData?.id && { id: initialData.id }),
      });
      router.push('/ifta/fuel');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this purchase.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="max-w-2xl space-y-5 rounded-lg border p-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
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
          <Label htmlFor="purchaseDate">Purchase date</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            required
            type="date"
            defaultValue={dateValue(initialData?.purchaseDate)}
          />
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="jurisdiction">Purchase jurisdiction</Label>
          <Input
            autoCapitalize="characters"
            id="jurisdiction"
            maxLength={3}
            name="jurisdiction"
            placeholder="e.g. TX"
            required
            defaultValue={initialData?.jurisdiction ?? ''}
          />
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="gallons">Gallons purchased</Label>
          <Input
            id="gallons"
            min="0.001"
            name="gallons"
            required
            step="0.001"
            type="number"
            defaultValue={initialData?.gallons ?? ''}
          />
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="amountCents">Purchase amount (USD)</Label>
          <Input
            id="amountCents"
            min="0"
            name="amountCents"
            required
            step="0.01"
            type="number"
            defaultValue={
              initialData?.amountCents === undefined
                ? ''
                : (initialData.amountCents / 100).toFixed(2)
            }
          />
        </div>
        <div className="grid gap-1.5 text-sm">
          <Label htmlFor="vendor">Vendor (optional)</Label>
          <Input id="vendor" name="vendor" defaultValue={initialData?.vendor ?? ''} />
        </div>
        <input name="currency" type="hidden" value={initialData?.currency ?? 'USD'} />
        <input name="driverId" type="hidden" value={initialData?.driverId ?? ''} />
      </div>
      <p className="text-muted-foreground text-sm">
        Report fuel where it was purchased. Purchased gallons are not the same as fuel consumed in
        that jurisdiction.
      </p>
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button disabled={isSaving || vehicles.length === 0} type="submit">
          {isSaving ? 'Saving…' : isEdit ? 'Save purchase' : 'Record purchase'}
        </Button>
        {vehicles.length === 0 && (
          <p className="text-muted-foreground self-center text-sm">
            Add a vehicle before recording a fuel purchase.
          </p>
        )}
      </div>
    </form>
  );
}
