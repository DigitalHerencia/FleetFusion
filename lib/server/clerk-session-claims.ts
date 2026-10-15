export interface ClerkOrganizationClaims {
  id: string;
  role?: string;
  permissions: string[];
}

export interface ClerkSessionClaims {
  userId: string;
  organization?: ClerkOrganizationClaims;
  permissions: string[];
  raw: Record<string, unknown>;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function stringValue(...values: unknown[]): string | undefined {
  return values
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
    ?.trim();
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value
            .filter((entry): entry is string => typeof entry === 'string')
            .map((entry) => entry.trim())
            .filter(Boolean),
        ),
      ]
    : [];
}

export function parseClerkSessionClaims(value: unknown): ClerkSessionClaims | null {
  const raw = objectValue(value);
  if (!raw) return null;
  const userId = stringValue(raw['sub'], raw['user_id']);
  if (!userId) return null;

  const org = objectValue(raw['o']) ?? objectValue(raw['organization']);
  const organizationId = stringValue(raw['org_id'], raw['organization_id'], org?.['id']);
  const role = stringValue(raw['org_role'], raw['role'], org?.['rol'], org?.['role']);
  const permissions = stringArray(raw['permissions'] ?? raw['org_permissions']);
  const orgPermissions = stringArray(org?.['permissions']);
  const organization = organizationId
    ? { id: organizationId, ...(role ? { role } : {}), permissions: orgPermissions }
    : undefined;

  return {
    userId,
    ...(organization ? { organization } : {}),
    permissions: [...new Set([...permissions, ...orgPermissions])],
    raw,
  };
}

export function getOrganizationIdFromClaims(value: unknown): string | undefined {
  return parseClerkSessionClaims(value)?.organization?.id;
}

export function getRoleFromClaims(value: unknown): string | undefined {
  return parseClerkSessionClaims(value)?.organization?.role;
}

export function getPermissionsFromClaims(value: unknown): string[] {
  return parseClerkSessionClaims(value)?.permissions ?? [];
}
