'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useRealtimeDispatchStatus(intervalMs = 30_000) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  useEffect(() => {
    const timer = window.setInterval(
      () => {
        router.refresh();
        setLastUpdated(new Date());
      },
      Math.max(intervalMs, 5_000),
    );
    return () => window.clearInterval(timer);
  }, [intervalMs, router]);
  return { lastUpdated, refresh: () => router.refresh() };
}

export function useDispatchWebsocket(onUpdate: (event: unknown) => void) {
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('fleetfusion:dispatch');
    channel.onmessage = (event: MessageEvent<unknown>) => onUpdate(event.data);
    return () => channel.close();
  }, [onUpdate]);
}
