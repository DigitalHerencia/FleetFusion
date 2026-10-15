'use client';

import { useState } from 'react';

import { deleteDriver } from '../lib/driversActions';

export function DriversBulkActions({
  drivers,
}: {
  drivers: Array<{ id: string; firstName: string; lastName: string }>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  async function removeSelected() {
    try {
      for (const id of selected) await deleteDriver({ id });
      setMessage(`${selected.length} driver(s) removed.`);
      setSelected([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove selected drivers.');
    }
  }
  return (
    <section className="bulk-actions">
      <details>
        <summary>Bulk driver actions</summary>
        {drivers.map((driver) => (
          <label key={driver.id}>
            <input
              type="checkbox"
              checked={selected.includes(driver.id)}
              onChange={() =>
                setSelected((current) =>
                  current.includes(driver.id)
                    ? current.filter((id) => id !== driver.id)
                    : [...current, driver.id],
                )
              }
            />
            {driver.firstName} {driver.lastName}
          </label>
        ))}
        <button type="button" disabled={!selected.length} onClick={removeSelected}>
          Delete selected
        </button>
      </details>
      {message && <p role="status">{message}</p>}
    </section>
  );
}

export default DriversBulkActions;
