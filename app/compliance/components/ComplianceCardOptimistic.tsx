'use client';

import { useState } from 'react';

export function ComplianceCardOptimistic({
  children,
  onUpdate,
}: {
  children: React.ReactNode;
  onUpdate?: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function refresh() {
    if (!onUpdate) return;
    setSaving(true);
    setError('');
    try {
      await onUpdate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update document.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div aria-busy={saving}>
      {children}
      {onUpdate && (
        <button type="button" onClick={refresh} disabled={saving}>
          Refresh
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
