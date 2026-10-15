import { notFound } from 'next/navigation';

import { ComplianceDetailClient } from '../../components/ComplianceDetailClient';
import { getComplianceDocumentById } from '../../lib/complianceFetchers';

export default async function ComplianceDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const document = await getComplianceDocumentById({ id: slug });
  if (!document) notFound();
  return <ComplianceDetailClient document={document} />;
}
