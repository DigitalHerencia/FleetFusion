'use client';

import { useEffect } from 'react';

import { trackDashboardView } from '../lib/analyticsActions';
import { useRealtimeAnalyticsStream } from '../lib/analyticsHooks';

export function AnalyticsLiveActivity() {
  const { data, error, isLoading, refresh } = useRealtimeAnalyticsStream();
  useEffect(() => {
    void trackDashboardView().catch(() => undefined);
  }, []);
  return (
    <section
      aria-live="polite"
      className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border px-5 py-4"
    >
      <div>
        <h2 className="font-semibold">Live activity</h2>
        <p className="text-muted-foreground text-sm">
          {error
            ? error
            : isLoading && !data
              ? 'Loading recent events…'
              : `${data?.value ?? 0} events in the last five minutes`}
        </p>
      </div>
      <button
        className="rounded-md border px-3 py-2 text-sm"
        disabled={isLoading}
        onClick={() => void refresh()}
        type="button"
      >
        Refresh
      </button>
    </section>
  );
}
