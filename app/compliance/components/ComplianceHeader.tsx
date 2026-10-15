import Link from 'next/link';
import type { ComplianceSummary } from '../types';

export function ComplianceHeader({ summary }: { summary: ComplianceSummary }) {
  return (
    <header className="domain-header">
      <div>
        <h1>Compliance</h1>
        <p>Track required documents and upcoming expiration dates.</p>
      </div>
      <Link className="button" href="/compliance/documents/new">
        Add document
      </Link>
      <dl className="summary-grid">
        <div>
          <dt>Total documents</dt>
          <dd>{summary.total}</dd>
        </div>
        <div>
          <dt>Valid</dt>
          <dd>{summary.valid}</dd>
        </div>
        <div>
          <dt>Expiring soon</dt>
          <dd>{summary.expiring}</dd>
        </div>
        <div>
          <dt>Expired</dt>
          <dd>{summary.expired}</dd>
        </div>
        <div>
          <dt>Vehicles covered</dt>
          <dd>{summary.vehicles}</dd>
        </div>
        <div>
          <dt>Drivers covered</dt>
          <dd>{summary.drivers}</dd>
        </div>
      </dl>
    </header>
  );
}
