'use client';

import { useCallback, useEffect, useState } from 'react';

import { loadExpirationAlerts } from './complianceActions';
import type { ComplianceDocumentRecord } from '../types';

export function useRealtimeComplianceAlerts(options: { pollIntervalMs?: number } = {}) {
  const [alerts, setAlerts] = useState<ComplianceDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalMs = Math.max(15_000, options.pollIntervalMs ?? 60_000);

  const refresh = useCallback(async () => {
    try {
      setAlerts(await loadExpirationAlerts());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load expiration alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), intervalMs);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [intervalMs, refresh]);

  return { alerts, loading, error, refresh };
}
