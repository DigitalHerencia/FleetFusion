'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createDocument, updateDocument } from '../lib/complianceActions';

type InitialDocument = {
  id?: string;
  type?: string;
  status?: string;
  title?: string;
  description?: string | null;
  vehicleId?: string | null;
  driverId?: string | null;
  issueDate?: Date | string | null;
  effectiveDate?: Date | string | null;
  expirationDate?: Date | string | null;
};

function dateValue(value?: Date | string | null) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function ComplianceForm({ initial }: { initial?: InitialDocument }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setError('');
    const optionalDate = (name: string) => {
      const value = String(formData.get(name) ?? '');
      return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
    };
    const payload = {
      ...(initial?.id ? { id: initial.id } : {}),
      type: String(formData.get('type')),
      status: String(formData.get('status')),
      title: String(formData.get('title')),
      description: String(formData.get('description') ?? '') || null,
      vehicleId: String(formData.get('vehicleId') ?? '') || null,
      driverId: String(formData.get('driverId') ?? '') || null,
      issueDate: optionalDate('issueDate'),
      effectiveDate: optionalDate('effectiveDate'),
      expirationDate: optionalDate('expirationDate'),
    };
    try {
      if (initial?.id) await updateDocument(payload);
      else await createDocument(payload);
      router.push('/compliance');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this document.');
      setBusy(false);
    }
  }

  return (
    <form action={submit} className="compliance-form">
      <label>
        Document title
        <input name="title" required maxLength={200} defaultValue={initial?.title ?? ''} />
      </label>
      <label>
        Type
        <select name="type" required defaultValue={initial?.type ?? 'VEHICLE_REGISTRATION'}>
          {[
            'VEHICLE_REGISTRATION',
            'INSURANCE',
            'CDL',
            'MEDICAL_CARD',
            'PERMIT',
            'IFTA_LICENCE',
            'OTHER',
          ].map((type) => (
            <option value={type} key={type}>
              {type.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select name="status" defaultValue={initial?.status ?? 'VALID'}>
          {['VALID', 'EXPIRING_SOON', 'EXPIRED', 'EXEMPT'].map((status) => (
            <option value={status} key={status}>
              {status.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <label>
        Description
        <textarea name="description" defaultValue={initial?.description ?? ''} maxLength={4000} />
      </label>
      <label>
        Vehicle ID
        <input name="vehicleId" defaultValue={initial?.vehicleId ?? ''} />
      </label>
      <label>
        Driver ID
        <input name="driverId" defaultValue={initial?.driverId ?? ''} />
      </label>
      <label>
        Issue date
        <input type="date" name="issueDate" defaultValue={dateValue(initial?.issueDate)} />
      </label>
      <label>
        Effective date
        <input type="date" name="effectiveDate" defaultValue={dateValue(initial?.effectiveDate)} />
      </label>
      <label>
        Expiration date
        <input
          type="date"
          name="expirationDate"
          defaultValue={dateValue(initial?.expirationDate)}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Create document'}
      </button>
    </form>
  );
}
