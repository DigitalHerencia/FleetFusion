import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DriverForm } from '../../components/DriverForm';
import { getDriverById } from '../../lib/driversFetchers';

export default async function EditDriverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const driver = await getDriverById({ id: slug });
  if (!driver) notFound();
  return (
    <main className="domain-page">
      <p>
        <Link href={`/drivers/${driver.id}`}>← Driver profile</Link>
      </p>
      <h1>
        Edit {driver.firstName} {driver.lastName}
      </h1>
      <DriverForm driver={driver} />
    </main>
  );
}
