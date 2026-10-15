import { RolesTable } from '../components/RolesTable';
import { getAllRoles } from '../lib/adminFetchers';

export default async function AdminRolesPage() {
  const roles = await getAllRoles();
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Roles and permissions</h1>
        <p className="text-muted-foreground mt-2">
          System-wide access is limited to super administrators.
        </p>
      </header>
      <RolesTable roles={roles} />
    </section>
  );
}
