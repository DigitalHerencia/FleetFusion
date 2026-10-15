'use client';

import type { Driver } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { createDriver, updateDriver } from '../lib/driversActions';

export function DriverForm({ driver }: { driver?: Driver }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const input = {
      firstName: String(form.get('firstName') ?? ''),
      lastName: String(form.get('lastName') ?? ''),
      email: String(form.get('email') ?? '') || null,
      phone: String(form.get('phone') ?? '') || null,
      licenseNumber: String(form.get('licenseNumber') ?? '') || null,
      licenseState: String(form.get('licenseState') ?? '') || null,
      licenseExpiry: form.get('licenseExpiry') ? new Date(String(form.get('licenseExpiry'))) : null,
      status: String(form.get('status') ?? 'ACTIVE'),
    };
    try {
      if (driver) await updateDriver({ id: driver.id, ...input });
      else await createDriver(input);
      router.push('/drivers');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save driver.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="domain-form" onSubmit={submit}>
      <label>
        First name
        <input name="firstName" required maxLength={100} defaultValue={driver?.firstName} />
      </label>
      <label>
        Last name
        <input name="lastName" required maxLength={100} defaultValue={driver?.lastName} />
      </label>
      <label>
        Email
        <input type="email" name="email" defaultValue={driver?.email ?? ''} />
      </label>
      <label>
        Phone
        <input type="tel" name="phone" defaultValue={driver?.phone ?? ''} />
      </label>
      <label>
        CDL number
        <input name="licenseNumber" defaultValue={driver?.licenseNumber ?? ''} />
      </label>
      <label>
        CDL state
        <input name="licenseState" maxLength={2} defaultValue={driver?.licenseState ?? ''} />
      </label>
      <label>
        CDL expiry
        <input
          type="date"
          name="licenseExpiry"
          defaultValue={driver?.licenseExpiry?.toISOString().slice(0, 10)}
        />
      </label>
      {driver && (
        <label>
          Status
          <select name="status" defaultValue={driver.status}>
            {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      )}
      {error && <p role="alert">{error}</p>}
      <button disabled={busy}>
        {busy ? 'Saving…' : driver ? 'Save changes' : 'Create driver'}
      </button>
    </form>
  );
}

export default DriverForm;
