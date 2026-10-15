'use client';

import { useState } from 'react';

import { deleteLoad } from '../lib/dispatchActions';

export function DispatchBulkActions({ loadIds }: { loadIds: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  async function removeSelected() {
    setMessage('');
    try {
      for (const id of selected) await deleteLoad({ id });
      setSelected([]);
      setMessage(`${selected.length} load(s) removed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove selected loads.');
    }
  }
  return (
    <section className="bulk-actions" aria-label="Bulk load actions">
      <details>
        <summary>Select loads for bulk actions</summary>
        <fieldset>
          <legend>Loads</legend>
          {loadIds.map((id) => (
            <label key={id}>
              <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
              {id}
            </label>
          ))}
        </fieldset>
        <button type="button" disabled={!selected.length} onClick={removeSelected}>
          Delete selected
        </button>
      </details>
      {message && <p role="status">{message}</p>}
    </section>
  );
}

export default DispatchBulkActions;
