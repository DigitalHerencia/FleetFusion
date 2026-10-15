import { ComplianceBulkActions } from './components/ComplianceBulkActions';
import { ComplianceFilters } from './components/ComplianceFilters';
import { ComplianceHeader } from './components/ComplianceHeader';
import { ComplianceList } from './components/ComplianceList';
import { getAllComplianceDocuments, getComplianceSummary } from './lib/complianceFetchers';

export default async function CompliancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [summary, documents] = await Promise.all([
    getComplianceSummary(),
    getAllComplianceDocuments({
      status: params.status || undefined,
      type: params.type || undefined,
      page: params.page || 1,
      pageSize: 25,
    }),
  ]);

  return (
    <main className="domain-page">
      <ComplianceHeader summary={summary} />
      <ComplianceFilters
        {...(params.status ? { status: params.status } : {})}
        {...(params.type ? { type: params.type } : {})}
      />
      <ComplianceBulkActions />
      <ComplianceList documents={documents} />
    </main>
  );
}
