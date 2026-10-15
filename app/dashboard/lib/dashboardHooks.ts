'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';

export type DashboardTab = 'overview' | 'operations' | 'compliance' | 'financials';

const tabEvent = 'fleetfusion:dashboard-tab';
function subscribeTab(callback: () => void) {
  window.addEventListener(tabEvent, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(tabEvent, callback);
    window.removeEventListener('storage', callback);
  };
}
function readTab(fallback: DashboardTab): DashboardTab {
  const saved = window.localStorage.getItem('fleetfusion:dashboard-tab') as DashboardTab | null;
  return saved && ['overview', 'operations', 'compliance', 'financials'].includes(saved)
    ? saved
    : fallback;
}

export function useTabPersistence(initialTab: DashboardTab = 'overview') {
  const tab = useSyncExternalStore(
    subscribeTab,
    () => readTab(initialTab),
    () => initialTab,
  );
  function selectTab(next: DashboardTab) {
    window.localStorage.setItem('fleetfusion:dashboard-tab', next);
    window.dispatchEvent(new Event(tabEvent));
  }
  return { tab, setTab: selectTab };
}

export function useAutoRotateTabs(tabs: DashboardTab[], intervalMs = 15_000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (tabs.length < 2 || intervalMs <= 0) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % tabs.length),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [intervalMs, tabs.length]);
  return tabs[index] ?? tabs[0] ?? 'overview';
}

export function useRealtimeKPIs(intervalMs = 30_000) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), Math.max(5_000, intervalMs));
    return () => window.clearInterval(timer);
  }, [intervalMs, router]);
}

export function useDashboardWebsocket(onEvent: (event: unknown) => void) {
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('fleetfusion:dashboard');
    channel.onmessage = (event: MessageEvent<unknown>) => onEvent(event.data);
    return () => channel.close();
  }, [onEvent]);
}
