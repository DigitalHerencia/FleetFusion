'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { type AnalyticsQueryInput, analyticsRanges } from '../schemas/analytics.schema';
import { runQuery } from './analyticsFetchers';

export function useAnalyticsQueryBuilder(initial: Partial<AnalyticsQueryInput> = {}) {
  const [query, setQuery] = useState<AnalyticsQueryInput>({
    kpi: initial.kpi ?? 'activity_events',
    range: initial.range ?? 'last_30d',
    filters: initial.filters ?? {},
  });
  const setKpi = useCallback(
    (kpi: AnalyticsQueryInput['kpi']) => setQuery((current) => ({ ...current, kpi })),
    [],
  );
  const setRange = useCallback(
    (range: AnalyticsQueryInput['range']) => setQuery((current) => ({ ...current, range })),
    [],
  );
  const setFilter = useCallback((key: string, value: unknown) => {
    setQuery((current) => ({ ...current, filters: { ...current.filters, [key]: value } }));
  }, []);
  const reset = useCallback(
    () => setQuery({ kpi: 'activity_events', range: 'last_30d', filters: {} }),
    [],
  );
  return useMemo(
    () => ({ query, setQuery, setKpi, setRange, setFilter, reset }),
    [query, setKpi, setRange, setFilter, reset],
  );
}

export function useReportDesigner(
  initial: {
    name?: string;
    description?: string;
    template?: 'kpi' | 'table' | 'chart';
    kpi?: AnalyticsQueryInput['kpi'];
    range?: AnalyticsQueryInput['range'];
  } = {},
) {
  const queryBuilder = useAnalyticsQueryBuilder(initial);
  const [name, setName] = useState(initial.name ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [template, setTemplate] = useState(initial.template ?? 'kpi');
  return {
    ...queryBuilder,
    name,
    setName,
    description,
    setDescription,
    template,
    setTemplate,
    supportedRanges: analyticsRanges,
  };
}

export function useRealtimeAnalyticsStream(pollIntervalMs = 15_000) {
  const [data, setData] = useState<Awaited<ReturnType<typeof runQuery>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await runQuery({ kpi: 'live', range: 'realtime', filters: {} });
      setData(result);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not refresh live analytics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), Math.max(5000, pollIntervalMs));
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [pollIntervalMs, refresh]);

  return { data, error, isLoading, refresh };
}
