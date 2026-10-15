import type { Driver } from '@prisma/client';
import Link from 'next/link';

export function DriverCard({ driver }: { driver: Driver }) {
  return (
    <article className="driver-card">
      <header>
        <div>
          <Link href={`/drivers/${driver.id}`}>
            <strong>
              {driver.firstName} {driver.lastName}
            </strong>
          </Link>
          <p>{driver.email ?? driver.phone ?? 'No contact information'}</p>
        </div>
        <span className={`status status-${driver.status.toLowerCase()}`}>{driver.status}</span>
      </header>
      <dl>
        <div>
          <dt>License</dt>
          <dd>
            {driver.licenseNumber ?? 'Not recorded'}
            {driver.licenseState ? ` · ${driver.licenseState}` : ''}
          </dd>
        </div>
        <div>
          <dt>Expires</dt>
          <dd>{driver.licenseExpiry?.toLocaleDateString() ?? 'Not recorded'}</dd>
        </div>
      </dl>
    </article>
  );
}

export default DriverCard;
