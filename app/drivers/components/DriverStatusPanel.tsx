import type { Driver } from '@prisma/client';

export function DriverStatusPanel({ driver, asOf }: { driver: Driver; asOf: Date }) {
  const daysToExpiry = driver.licenseExpiry
    ? Math.ceil((driver.licenseExpiry.getTime() - asOf.getTime()) / 86_400_000)
    : null;
  const warning = daysToExpiry !== null && daysToExpiry <= 30;
  return (
    <aside className="driver-status-panel">
      <h2>Profile status</h2>
      <p>
        <strong>{driver.status}</strong>
      </p>
      <p>
        CDL:{' '}
        {driver.licenseExpiry ? driver.licenseExpiry.toLocaleDateString() : 'Expiry not recorded'}
      </p>
      {warning && (
        <p role="alert">
          {daysToExpiry! < 0 ? 'CDL has expired.' : `CDL expires in ${daysToExpiry} day(s).`}
        </p>
      )}
    </aside>
  );
}

export default DriverStatusPanel;
