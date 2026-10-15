'use client';

import { type FormEvent, useState } from 'react';

import { updateFeatureFlags } from '../lib/settingsActions';
import { useSettingsAction } from '../lib/settingsHooks';

const planManagedFlags = new Set([
  'dispatch',
  'fleetManagement',
  'ifta',
  'customReports',
  'apiAccess',
  'sso',
]);

export function FeatureFlagsTable({ flags }: { flags: Record<string, boolean> }) {
  const [values, setValues] = useState(flags);
  const { execute, isPending, error, result } = useSettingsAction(updateFeatureFlags);
  const editableFlags = Object.fromEntries(
    Object.entries(values).filter(([key]) => !planManagedFlags.has(key)),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    execute({ flags: editableFlags });
  }

  return (
    <form
      onSubmit={submit}
      className="grid max-w-3xl gap-4 rounded-xl border bg-white p-6 shadow-sm"
    >
      {Object.entries(values).map(([key, enabled]) => {
        const locked = planManagedFlags.has(key);
        return (
          <label
            key={key}
            className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
          >
            <span>
              <span className="block font-medium">
                {key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}
              </span>
              <span className="text-xs text-slate-500">
                {locked ? 'Managed by subscription plan' : 'Organization override'}
              </span>
            </span>
            <input
              type="checkbox"
              checked={enabled}
              disabled={locked}
              onChange={(event) =>
                setValues((current) => ({ ...current, [key]: event.target.checked }))
              }
              aria-label={`${key} enabled`}
              className="size-4 accent-slate-900"
            />
          </label>
        );
      })}
      {!Object.keys(values).length ? (
        <p className="text-sm text-slate-500">No feature flags are configured.</p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Save feature flags'}
      </button>
      <p aria-live="polite" className={error ? 'text-sm text-red-700' : 'text-sm text-emerald-700'}>
        {error || (result ? `${result.updatedCount} feature flags saved.` : '')}
      </p>
    </form>
  );
}
