'use client';

import type { Load } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { createLoad, updateLoad } from '../lib/dispatchActions';

export function DispatchForm({ load }: { load?: Load }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const input = {
      reference: String(values['reference'] ?? ''),
      pickupAddress: String(values['pickupAddress'] ?? '') || null,
      pickupCity: String(values['pickupCity'] ?? '') || null,
      pickupState: String(values['pickupState'] ?? '') || null,
      pickupScheduledAt: values['pickupScheduledAt']
        ? new Date(String(values['pickupScheduledAt']))
        : null,
      dropoffAddress: String(values['dropoffAddress'] ?? '') || null,
      dropoffCity: String(values['dropoffCity'] ?? '') || null,
      dropoffState: String(values['dropoffState'] ?? '') || null,
      dropoffScheduledAt: values['dropoffScheduledAt']
        ? new Date(String(values['dropoffScheduledAt']))
        : null,
      rateCents: values['rate'] ? Math.round(Number(values['rate']) * 100) : null,
      currency: String(values['currency'] ?? 'USD'),
    };
    try {
      if (load) await updateLoad({ id: load.id, ...input });
      else await createLoad(input);
      router.push('/dispatch');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this load.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="domain-form" onSubmit={submit}>
      <label>
        Load reference
        <input name="reference" required maxLength={80} defaultValue={load?.reference} />
      </label>
      <fieldset>
        <legend>Pickup</legend>
        <label>
          Address
          <input name="pickupAddress" defaultValue={load?.pickupAddress ?? ''} />
        </label>
        <label>
          City
          <input name="pickupCity" defaultValue={load?.pickupCity ?? ''} />
        </label>
        <label>
          State
          <input name="pickupState" maxLength={2} defaultValue={load?.pickupState ?? ''} />
        </label>
        <label>
          Scheduled
          <input
            type="datetime-local"
            name="pickupScheduledAt"
            defaultValue={load?.pickupScheduledAt?.toISOString().slice(0, 16)}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>Delivery</legend>
        <label>
          Address
          <input name="dropoffAddress" defaultValue={load?.dropoffAddress ?? ''} />
        </label>
        <label>
          City
          <input name="dropoffCity" defaultValue={load?.dropoffCity ?? ''} />
        </label>
        <label>
          State
          <input name="dropoffState" maxLength={2} defaultValue={load?.dropoffState ?? ''} />
        </label>
        <label>
          Scheduled
          <input
            type="datetime-local"
            name="dropoffScheduledAt"
            defaultValue={load?.dropoffScheduledAt?.toISOString().slice(0, 16)}
          />
        </label>
      </fieldset>
      <label>
        Rate
        <input
          type="number"
          name="rate"
          min="0"
          step="0.01"
          defaultValue={load?.rateCents == null ? '' : (load.rateCents / 100).toFixed(2)}
        />
      </label>
      <label>
        Currency
        <input name="currency" maxLength={3} defaultValue={load?.currency ?? 'USD'} />
      </label>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy}>{busy ? 'Saving…' : load ? 'Save changes' : 'Create load'}</button>
    </form>
  );
}

export default DispatchForm;
