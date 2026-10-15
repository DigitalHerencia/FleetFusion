'use client';

import { type FormEvent } from 'react';

import { updateOrgProfile } from '../lib/settingsActions';
import { useSettingsAction } from '../lib/settingsHooks';
import type { OrganizationSettingsProfile } from '../types';

const fields = [
  ['legalName', 'Legal name'],
  ['dbaName', 'Doing-business-as name'],
  ['dotNumber', 'USDOT number'],
  ['mcNumber', 'MC number'],
  ['addressLine1', 'Address line 1'],
  ['addressLine2', 'Address line 2'],
  ['city', 'City'],
  ['state', 'State / province'],
  ['postalCode', 'Postal code'],
  ['country', 'Country'],
] as const;

export function OrganizationProfileForm({ profile }: { profile: OrganizationSettingsProfile }) {
  const { execute, isPending, error, result } = useSettingsAction(updateOrgProfile);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(data.entries());
    execute(values);
  }

  return (
    <form
      onSubmit={submit}
      className="grid max-w-3xl gap-5 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium sm:col-span-2">
          Organization name
          <input
            name="name"
            required
            maxLength={160}
            defaultValue={profile.name}
            className="rounded-md border px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium sm:col-span-2">
          Time zone
          <input
            name="timezone"
            required
            maxLength={80}
            defaultValue={profile.timezone}
            className="rounded-md border px-3 py-2 font-normal"
          />
        </label>
        {fields.map(([name, label]) => (
          <label key={name} className="grid gap-1 text-sm font-medium">
            {label}
            <input
              name={name}
              maxLength={name.includes('Number') ? 32 : 160}
              defaultValue={profile[name]}
              className="rounded-md border px-3 py-2 font-normal"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Save organization profile'}
      </button>
      <p aria-live="polite" className={error ? 'text-sm text-red-700' : 'text-sm text-emerald-700'}>
        {error || (result ? 'Organization profile saved.' : '')}
      </p>
    </form>
  );
}
