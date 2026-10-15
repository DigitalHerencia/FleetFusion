'use client';

import type { DriverShift } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { endDriverShift, startDriverShift, syncDriverLocation } from '../lib/driversMobileFlows';
import { DriverMobileHeader } from './DriverMobileHeader';

export function DriverMobileWorkflows({
  driverId,
  driverName,
  activeShift,
}: {
  driverId: string;
  driverName: string;
  activeShift?: DriverShift | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function run(operation: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage('');
    try {
      await operation();
      setMessage(success);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The mobile action failed.');
    } finally {
      setBusy(false);
    }
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      setMessage('Location is not available on this device.');
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void run(
          () =>
            syncDriverLocation({
              driverId,
              lat: coords.latitude,
              lng: coords.longitude,
              speedKph: coords.speed == null ? undefined : coords.speed * 3.6,
              headingDegrees: coords.heading ?? undefined,
              capturedAt: new Date(),
            }),
          'Location updated.',
        );
      },
      () => {
        setBusy(false);
        setMessage('Location permission was denied or location could not be read.');
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  }

  return (
    <section className="driver-mobile-workflows dashboard-panel">
      <DriverMobileHeader name={driverName} />
      <h2>Mobile workflows</h2>
      {activeShift ? (
        <div>
          <p>Shift started {activeShift.startedAt.toLocaleString()}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(
                () =>
                  endDriverShift({
                    driverId,
                    shiftId: activeShift.id,
                    endedAt: new Date(),
                  }),
                'Shift ended.',
              )
            }
          >
            End shift
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void run(() => startDriverShift({ driverId, startedAt: new Date() }), 'Shift started.')
          }
        >
          Start shift
        </button>
      )}
      <button type="button" disabled={busy} onClick={shareLocation}>
        Share current location
      </button>
      {message && <p role="status">{message}</p>}
    </section>
  );
}

export default DriverMobileWorkflows;
