import type { ComplianceDocumentRecord } from '../types';

export function ComplianceCard({ document }: { document: ComplianceDocumentRecord }) {
  const entity = document.vehicle
    ? document.vehicle.name || document.vehicle.plateNumber || 'Vehicle'
    : document.driver
      ? `${document.driver.firstName} ${document.driver.lastName}`
      : 'Organization';
  const expiration = document.expirationDate
    ? new Date(document.expirationDate).toLocaleDateString()
    : 'No expiration date';

  return (
    <article className="compliance-card">
      <div>
        <h2>
          <a href={`/compliance/documents/${encodeURIComponent(document.id)}`}>{document.title}</a>
        </h2>
        <p>
          {document.type.replaceAll('_', ' ')} · {entity}
        </p>
      </div>
      <div>
        <span className={`status status-${document.status.toLowerCase()}`}>
          {document.status.replaceAll('_', ' ')}
        </span>
        <p>Expires: {expiration}</p>
      </div>
    </article>
  );
}
