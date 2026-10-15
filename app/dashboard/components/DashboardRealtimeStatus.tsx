'use client';

import { useRealtimeKPIs } from '../lib/dashboardHooks';

export function DashboardRealtimeStatus() {
  useRealtimeKPIs();
  return (
    <p className="realtime-status">
      <span aria-hidden="true">●</span> Automatically refreshes every 30 seconds
    </p>
  );
}

export default DashboardRealtimeStatus;
