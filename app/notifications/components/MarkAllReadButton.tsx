'use client';

import { useState } from 'react';

import { markAllRead } from '../lib/notificationActions';

export function MarkAllReadButton() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function mark() {
    setBusy(true);
    setMessage('');
    try {
      const count = await markAllRead();
      setMessage(`${count} notification${count === 1 ? '' : 's'} marked as read.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to update notifications.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={mark} disabled={busy}>
        {busy ? 'Updating…' : 'Mark all as read'}
      </button>
      {message && <span role="status">{message}</span>}
    </div>
  );
}
