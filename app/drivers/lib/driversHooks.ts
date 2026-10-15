'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRealtimeDriverStatus(intervalMs = 30_000) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), Math.max(5_000, intervalMs));
    return () => window.clearInterval(timer);
  }, [intervalMs, router]);
  return { refresh: () => router.refresh() };
}

export function useDriverAssignments(onUpdate?: (event: unknown) => void) {
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('fleetfusion:driver-assignments');
    channel.onmessage = (event: MessageEvent<unknown>) => onUpdate?.(event.data);
    return () => channel.close();
  }, [onUpdate]);
}
