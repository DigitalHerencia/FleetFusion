'use client';

import { useState, useTransition } from 'react';

import { createInvite } from '../lib/authActions';

export function InviteForm() {
  const [message, setMessage] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const payload = {
      email: String(formData.get('email') ?? ''),
      role: String(formData.get('role') ?? 'member'),
    };
    startTransition(async () => {
      try {
        const invitation = await createInvite(payload);
        setInviteUrl(invitation.inviteUrl);
        setMessage(`Invitation created for ${invitation.email}.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to create invitation.');
      }
    });
  }

  return (
    <form
      action={submit}
      className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-[1fr_12rem_auto]"
    >
      <label className="grid gap-1 text-sm font-medium">
        Invite email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={320}
          className="rounded-md border px-3 py-2 font-normal"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Role
        <select
          name="role"
          defaultValue="member"
          className="rounded-md border px-3 py-2 font-normal"
        >
          <option value="member">Member</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="driver_manager">Driver manager</option>
          <option value="compliance_manager">Compliance manager</option>
          <option value="analyst">Analyst</option>
          <option value="billing">Billing</option>
          <option value="manager">Manager</option>
          <option value="admin">Administrator</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="self-end rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Creating…' : 'Invite member'}
      </button>
      <p aria-live="polite" className="text-sm text-slate-600 sm:col-span-3">
        {message}
      </p>
      {inviteUrl ? (
        <p className="text-sm break-all sm:col-span-3">
          Invitation link:{' '}
          <a className="underline" href={inviteUrl}>
            {inviteUrl}
          </a>
        </p>
      ) : null}
    </form>
  );
}
