import type { OrgContext } from '@/lib/server/auth';

type PermissionRole = string | { name?: string; permissions?: string[] };
type PermissionInput = Partial<OrgContext> & {
  claims?: unknown;
  roles?: PermissionRole[];
};

const SUPER_ADMIN_ROLES = new Set(['super-admin', 'super_admin', 'superadmin']);

function claimPermissions(claims: unknown): string[] {
  if (!claims || typeof claims !== 'object' || !('permissions' in claims)) return [];
  const permissions = (claims as { permissions?: unknown }).permissions;
  return Array.isArray(permissions)
    ? permissions.filter((permission): permission is string => typeof permission === 'string')
    : [];
}

export function resolveAdminPermissions(input: PermissionInput = {}): string[] {
  const permissions = new Set<string>([
    ...(input.permissions ?? []),
    ...claimPermissions(input.claims),
  ]);
  const roles = [
    input.role,
    ...(input.roles ?? []).map((role) => (typeof role === 'string' ? role : role.name)),
  ].filter((role): role is string => Boolean(role));

  if (roles.some((role) => SUPER_ADMIN_ROLES.has(role.toLowerCase()))) {
    permissions.add('*');
    permissions.add('admin:*');
  }
  for (const role of input.roles ?? []) {
    if (typeof role !== 'string') {
      role.permissions?.forEach((permission) => permissions.add(permission));
    }
  }
  return [...permissions];
}

function hasPermission(input: PermissionInput, permission: string): boolean {
  const permissions = resolveAdminPermissions(input);
  return (
    permissions.includes('*') || permissions.includes('admin:*') || permissions.includes(permission)
  );
}

export function canManageRoles(input: PermissionInput): boolean {
  return hasPermission(input, 'admin:roles:manage') || hasPermission(input, 'roles:manage');
}

export function canManageOrganizations(input: PermissionInput): boolean {
  return (
    hasPermission(input, 'admin:organizations:manage') ||
    hasPermission(input, 'organizations:manage')
  );
}

export function canAccessSystemDocs(input: PermissionInput): boolean {
  return hasPermission(input, 'admin:documents:manage') || hasPermission(input, 'documents:manage');
}
