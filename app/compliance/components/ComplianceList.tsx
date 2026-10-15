import { ComplianceCard } from './ComplianceCard';
import type { ComplianceDocumentRecord } from '../types';

export function ComplianceList({ documents }: { documents: ComplianceDocumentRecord[] }) {
  if (!documents.length) {
    return <p className="empty-state">No compliance documents match these filters.</p>;
  }
  return (
    <section className="compliance-list" aria-label="Compliance documents">
      {documents.map((document) => (
        <ComplianceCard document={document} key={document.id} />
      ))}
    </section>
  );
}
