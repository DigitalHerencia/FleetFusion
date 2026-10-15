'use client';

import type { Driver } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteDriver } from '../lib/driversActions';

export function DriverDetailClient({ driver }: { driver: Driver }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  async function remove() {
    try {
      await deleteDriver({ id: driver.id });
      router.push('/drivers');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete driver.');
    }
  }
  return (
    <div className="detail-actions">
      <button type="button" className="danger" onClick={remove}>
        Delete driver
      </button>
      {message && <p role="alert">{message}</p>}
    </div>
  );
}

export default DriverDetailClient;
