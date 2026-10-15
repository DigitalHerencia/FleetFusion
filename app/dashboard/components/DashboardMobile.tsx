import type { FleetOverview } from './DashboardKPIs';

export function DashboardMobile({ overview }: { overview: FleetOverview }) {
  return (
    <section className="dashboard-mobile" aria-label="Mobile fleet summary">
      <h2>Fleet summary</h2>
      <p>{overview.activeLoads} active loads</p>
      <p>{overview.fleetUtilization}% fleet utilization</p>
      <p>{overview.onTimeDeliveryRate}% on-time deliveries</p>
    </section>
  );
}

export default DashboardMobile;
