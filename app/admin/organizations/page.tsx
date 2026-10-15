import { OrganizationsTable } from '../components/OrganizationsTable';
import { getAllOrganizations } from '../lib/adminFetchers';

export default async function AdminOrganizationsPage() {
  const organizations = await getAllOrganizations();
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Organizations</h1>
        <p className="text-muted-foreground mt-2">
          Tenant records and associated fleet and membership counts.
        </p>
      </header>
      <OrganizationsTable organizations={organizations} />
    </section>
  );
}
