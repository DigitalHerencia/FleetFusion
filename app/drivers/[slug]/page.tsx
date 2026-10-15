import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DriverDetailClient } from '../components/DriverDetailClient';
import { DriverDocsUpload } from '../components/DriverDocsUpload';
import { DriverLoadsList } from '../components/DriverLoadsList';
import { DriverMobileWorkflows } from '../components/DriverMobileWorkflows';
import { DriverStatusPanel } from '../components/DriverStatusPanel';
import { getDriverById } from '../lib/driversFetchers';

export default async function DriverDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const driver = await getDriverById({ id: slug });
  if (!driver) notFound();
  return (
    <main className="domain-page">
      <p>
        <Link href="/drivers">← Drivers</Link>
      </p>
      <header className="page-header">
        <div>
          <p className="eyebrow">Driver profile</p>
          <h1>
            {driver.firstName} {driver.lastName}
          </h1>
        </div>
        <Link href={`/drivers/${driver.id}/edit`}>Edit profile</Link>
      </header>
      <div className="detail-grid">
        <section>
          <h2>Contact</h2>
          <p>{driver.email ?? 'No email'}</p>
          <p>{driver.phone ?? 'No phone'}</p>
        </section>
        <DriverStatusPanel driver={driver} asOf={new Date()} />
      </div>
      <DriverDetailClient driver={driver} />
      <DriverMobileWorkflows
        driverId={driver.id}
        driverName={`${driver.firstName} ${driver.lastName}`}
        activeShift={driver.shifts.find((shift) => shift.endedAt === null) ?? null}
      />
      <section>
        <h2>Documents</h2>
        {driver.documents.map((document) => (
          <article key={document.id}>
            <strong>{document.title}</strong>
            <span>{document.type}</span>
            {document.file?.url && (
              <a href={document.file.url} target="_blank" rel="noreferrer">
                Open file
              </a>
            )}
          </article>
        ))}
        {!driver.documents.length && <p>No documents uploaded.</p>}
        <DriverDocsUpload driverId={driver.id} />
      </section>
      <DriverLoadsList loads={driver.loads} />
      <section>
        <h2>Recent shifts</h2>
        {driver.shifts.map((shift) => (
          <p key={shift.id}>
            {shift.startedAt.toLocaleString()} – {shift.endedAt?.toLocaleString() ?? 'In progress'}
          </p>
        ))}
        {!driver.shifts.length && <p>No shift history.</p>}
      </section>
    </main>
  );
}
