export type { OrganizationInput, RoleInput, SystemDocumentInput } from '../schemas/admin.schema';

export type AdminDashboardSnapshot = {
  organizations: number;
  activeOrganizations: number;
  roles: number;
  documents: number;
  pendingMemberships: number;
  database: { status: 'online' | 'unavailable'; latencyMs: number | null };
};
