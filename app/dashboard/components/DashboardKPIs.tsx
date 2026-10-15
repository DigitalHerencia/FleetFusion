export type FleetOverview = {
  activeLoads: number;
  onTimeDeliveryRate: number;
  fleetUtilization: number;
  revenueCents: number;
  totalLoads: number;
  vehicleCount: number;
  activeVehicles: number;
};

export function DashboardKPIs({ overview }: { overview: FleetOverview }) {
  const cards = [
    {
      label: 'Active loads',
      value: overview.activeLoads.toLocaleString(),
      detail: `${overview.totalLoads} total loads`,
    },
    {
      label: 'On-time delivery',
      value: `${overview.onTimeDeliveryRate}%`,
      detail: 'Delivered loads',
    },
    {
      label: 'Fleet utilization',
      value: `${overview.fleetUtilization}%`,
      detail: `${overview.activeVehicles} of ${overview.vehicleCount} vehicles active`,
    },
    {
      label: 'Revenue',
      value: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
        overview.revenueCents / 100,
      ),
      detail: 'Delivered load rates',
    },
  ];
  return (
    <section className="dashboard-kpis" aria-label="Fleet performance indicators">
      {cards.map((card) => (
        <article className="dashboard-kpi" key={card.label}>
          <p>{card.label}</p>
          <strong>{card.value}</strong>
          <small>{card.detail}</small>
        </article>
      ))}
    </section>
  );
}

export default DashboardKPIs;
