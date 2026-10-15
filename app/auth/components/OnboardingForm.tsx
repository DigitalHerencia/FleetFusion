'use client';

import { useState, useTransition } from 'react';

import { completeOnboarding } from '../lib/authActions';

type OnboardingValues = {
  companyName?: string;
  timezone?: string;
  legalName?: string;
  dotNumber?: string;
  mcNumber?: string;
};

export function OnboardingForm({ initialValues = {} }: { initialValues?: OnboardingValues }) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const payload = {
      step: 'company_profile' as const,
      companyName: String(formData.get('companyName') ?? ''),
      timezone: String(formData.get('timezone') ?? ''),
      legalName: String(formData.get('legalName') ?? ''),
      dotNumber: String(formData.get('dotNumber') ?? ''),
      mcNumber: String(formData.get('mcNumber') ?? ''),
    };
    startTransition(async () => {
      try {
        await completeOnboarding(payload);
        setMessage('Your organization profile is saved.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to save onboarding details.');
      }
    });
  }

  return (
    <form action={submit} className="grid max-w-2xl gap-5 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="companyName">
          Organization name
        </label>
        <input
          id="companyName"
          name="companyName"
          required
          maxLength={160}
          defaultValue={initialValues.companyName}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="timezone">
          Time zone
        </label>
        <input
          id="timezone"
          name="timezone"
          required
          maxLength={80}
          defaultValue={initialValues.timezone ?? 'America/Denver'}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="legalName">
          Legal name
        </label>
        <input
          id="legalName"
          name="legalName"
          maxLength={160}
          defaultValue={initialValues.legalName}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="dotNumber">
            USDOT number
          </label>
          <input
            id="dotNumber"
            name="dotNumber"
            maxLength={32}
            defaultValue={initialValues.dotNumber}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="mcNumber">
            MC number
          </label>
          <input
            id="mcNumber"
            name="mcNumber"
            maxLength={32}
            defaultValue={initialValues.mcNumber}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Save and continue'}
      </button>
      <p aria-live="polite" className="text-sm text-slate-600">
        {message}
      </p>
    </form>
  );
}
