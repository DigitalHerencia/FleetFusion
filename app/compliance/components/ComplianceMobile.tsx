import { ComplianceList } from './ComplianceList';
import type { ComplianceDocumentRecord } from '../types';

export function ComplianceMobile({ documents }: { documents: ComplianceDocumentRecord[] }) {
  return (
    <div className="compliance-mobile">
      <ComplianceList documents={documents} />
    </div>
  );
}
