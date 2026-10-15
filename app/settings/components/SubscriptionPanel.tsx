'use client';

import { type FormEvent, useState } from 'react';

import { updateSubscription } from '../lib/settingsActions';
import { useSettingsAction } from '../lib/settingsHooks';
import type { SettingsSubscription } from '../types';

export function SubscriptionPanel({ subscription }: { subscription: SettingsSubscription }) {
  const [planKey, setPlanKey] = useState(subscription.planKey);
  const { execute, isPending, error, result } = useSettingsAction(updateSubscription);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    execute({ planKey });
  }

  return (
    <section className="grid max-w-3xl gap-5 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Current plan: {subscription.planKey}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Status: {subscription.status.toLowerCase().replace('_', ' ')}
          </p>
        </div>
        {subscription.renewsAt ? (
          <p className="text-sm text-slate-600">
            Renews {new Date(subscription.renewsAt).toLocaleDateString()}
          </p>
        ) : null}
      </div>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {Object.entries(subscription.features).map(([key, enabled]) => (
          <li key={key} className="flex justify-between rounded-md bg-slate-50 px-3 py-2">
            <span>{key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</span>
            <span>{enabled ? 'Included' : 'Not included'}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3 border-t pt-4">
        <label className="grid gap-1 text-sm font-medium">
          Plan
          <select
            value={planKey}
            onChange={(event) => setPlanKey(event.target.value)}
            className="rounded-md border px-3 py-2 font-normal"
          >
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={isPending || planKey === subscription.planKey}
          className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {isPending ? 'Updating…' : 'Update plan'}
        </button>
      </form>
      <p aria-live="polite" className={error ? 'text-sm text-red-700' : 'text-sm text-emerald-700'}>
        {error || (result ? 'Plan updated.' : 'Plan changes are recorded for this organization.')}
      </p>
      <p className="text-xs text-slate-500">
        A billing provider is not connected. Changing the stored plan does not charge a payment
        method.
      </p>
    </section>
  );
}
