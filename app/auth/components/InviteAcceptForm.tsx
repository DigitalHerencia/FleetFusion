'use client';

import { useState, useTransition } from 'react';

import { acceptInvite } from '../lib/authActions';

export function InviteAcceptForm({ token, email }: { token: string; email: string }) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      try {
        await acceptInvite({ token });
        setMessage('Invitation accepted. Your organization access is ready.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to accept invitation.');
      }
    });
  }

  return (
    <div className="grid max-w-xl gap-4 rounded-xl border bg-white p-6 shadow-sm">
      <p>
        This invitation was sent to <strong>{email}</strong>. Sign in with that account to continue.
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="w-fit rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Accepting…' : 'Accept invitation'}
      </button>
      <p aria-live="polite" className="text-sm text-slate-600">
        {message}
      </p>
    </div>
  );
}
