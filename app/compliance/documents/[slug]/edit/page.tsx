import { notFound } from 'next/navigation';

import { ComplianceForm } from '../../../components/ComplianceForm';
import { getComplianceDocumentById } from '../../../lib/complianceFetchers';

export default async function EditComplianceDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const document = await getComplianceDocumentById({ id: slug });
  if (!document) notFound();
  return (
    <main className="domain-page">
      <h1>Edit compliance document</h1>
      <ComplianceForm initial={document} />
    </main>
  );
}
