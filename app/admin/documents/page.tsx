import { DocumentsTable } from '../components/DocumentsTable';
import { getSystemDocuments } from '../lib/adminFetchers';

export default async function AdminDocumentsPage() {
  const documents = await getSystemDocuments();
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">System documents</h1>
        <p className="text-muted-foreground mt-2">
          Edit global runbooks and organization-specific reference records.
        </p>
      </header>
      <DocumentsTable documents={documents} />
    </section>
  );
}
