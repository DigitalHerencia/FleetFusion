'use client';

import { useState } from 'react';

import { refreshDashboardCache } from '../lib/dashboardActions';

export function DashboardHeader({
  organizationName = 'Fleet overview',
}: {
  organizationName?: string;
}) {
  const [message, setMessage] = useState('');
  async function refresh() {
    await refreshDashboardCache();
    setMessage('Dashboard refreshed.');
  }
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">FleetFusion</p>
        <h1>{organizationName}</h1>
        <p>Operational performance at a glance.</p>
      </div>
      <div>
        <button type="button" onClick={refresh}>
          Refresh data
        </button>
        {message && <span role="status">{message}</span>}
      </div>
    </header>
  );
}

export default DashboardHeader;
