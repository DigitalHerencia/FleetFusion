import type { Route } from 'next';
import Link from 'next/link';

const actions: Array<{ href: Route; label: string; description: string }> = [
  { href: '/dispatch/new', label: 'Create a load', description: 'Add a shipment to the board' },
  { href: '/drivers/new', label: 'Add a driver', description: 'Create a driver profile' },
  { href: '/vehicles/new', label: 'Add a vehicle', description: 'Register a fleet vehicle' },
  { href: '/compliance', label: 'Review compliance', description: 'Check expiring documents' },
];

export function DashboardQuickActions() {
  return (
    <section className="dashboard-panel">
      <h2>Quick actions</h2>
      <div className="quick-actions">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <strong>{action.label}</strong>
            <span>{action.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default DashboardQuickActions;
