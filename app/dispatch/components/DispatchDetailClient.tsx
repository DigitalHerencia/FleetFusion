'use client';

import type { Driver, Load } from '@prisma/client';
import { useState } from 'react';

import { assignDriverToLoad, updateLoadStatus } from '../lib/dispatchActions';

export function DispatchDetailClient({
  load,
  drivers = [],
}: {
  load: Load;
  drivers?: Pick<Driver, 'id' | 'firstName' | 'lastName' | 'status'>[];
}) {
  const [message, setMessage] = useState('');
  const [driverId, setDriverId] = useState('');
  const next: Record<string, string> = {
    DRAFT: 'PLANNED',
    PLANNED: 'ASSIGNED',
    ASSIGNED: 'AT_PICKUP',
    AT_PICKUP: 'IN_TRANSIT',
    IN_TRANSIT: 'AT_DROPOFF',
    AT_DROPOFF: 'DELIVERED',
  };
  async function advance() {
    const status = next[load.status];
    if (!status) return;
    try {
      await updateLoadStatus({ id: load.id, status });
      setMessage(`Load moved to ${status.replaceAll('_', ' ')}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update status.');
    }
  }
  async function assign() {
    if (!driverId) return;
    try {
      await assignDriverToLoad({ loadId: load.id, driverId });
      setMessage('Driver assigned.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to assign driver.');
    }
  }
  return (
    <div className="detail-actions">
      <label>
        Assign driver
        <select value={driverId} onChange={(event) => setDriverId(event.target.value)}>
          <option value="">Choose an active driver</option>
          {drivers
            .filter((driver) => driver.status === 'ACTIVE')
            .map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.firstName} {driver.lastName}
              </option>
            ))}
        </select>
      </label>
      <button type="button" disabled={!driverId} onClick={assign}>
        Assign
      </button>
      {next[load.status] && (
        <button type="button" onClick={advance}>
          Move to {next[load.status]?.replaceAll('_', ' ')}
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}

export default DispatchDetailClient;
