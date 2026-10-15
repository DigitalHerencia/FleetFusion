import type { OrgContext } from '@/lib/server/auth';

export type AppRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'dispatcher'
  | 'driver_manager'
  | 'compliance_manager'
  | 'analyst'
  | 'billing'
  | 'member'
  | 'driver'
  | 'accountant'
  | 'viewer';

const ROLE_PERMISSIONS: Readonly<Record<AppRole, readonly string[]>> = Object.freeze({
  owner: ['*'],
  admin: ['*'],
  manager: [
    'dispatch:*',
    'vehicles:*',
    'drivers:*',
    'compliance:*',
    'ifta:*',
    'analytics:*',
    'settings:read',
    'settings:members:read',
  ],
  dispatcher: [
    'dispatch:read',
    'dispatch:create',
    'dispatch:update',
    'dispatch:assign',
    'vehicles:read',
    'drivers:read',
  ],
  driver_manager: ['drivers:*', 'dispatch:read', 'dispatch:assign', 'vehicles:read'],
  compliance_manager: ['compliance:*', 'drivers:read', 'vehicles:read'],
  analyst: ['analytics:*', 'dispatch:read', 'vehicles:read', 'drivers:read', 'ifta:read'],
  billing: ['billing:*', 'settings:read'],
  member: ['dispatch:read', 'vehicles:read', 'drivers:read', 'compliance:read'],
  driver: ['dispatch:read', 'dispatch:update:own', 'compliance:read:own'],
  accountant: ['billing:read', 'ifta:read', 'analytics:read'],
  viewer: ['dispatch:read', 'vehicles:read', 'drivers:read', 'compliance:read', 'analytics:read'],
});

const ROLE_ALIASES: Readonly<Record<string, AppRole>> = Object.freeze({
  org_owner: 'owner',
  organization_owner: 'owner',
  superadmin: 'admin',
  super_admin: 'admin',
});

export class AuthorizationError extends Error {
  constructor(message = 'You are not authorized to perform this action.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

function normalizeRole(role: string): string {
  const normalized = role.trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');
  return ROLE_ALIASES[normalized] ?? normalized;
}

function rolePermissions(role: string): readonly string[] {
  const normalized = normalizeRole(role);
  return normalized in ROLE_PERMISSIONS ? ROLE_PERMISSIONS[normalized as AppRole] : [];
}

export function getPermissionsForRole(role: string): readonly string[] {
  return rolePermissions(role);
}

function matchesPermission(granted: string, required: string): boolean {
  if (granted === '*' || granted === required) return true;
  return granted.endsWith(':*') && required.startsWith(granted.slice(0, -1));
}

export function hasPermission(
  context: Pick<OrgContext, 'role' | 'permissions'>,
  requiredPermission: string,
): boolean {
  if (!requiredPermission.trim()) return false;
  const granted = [
    ...(context.role ? rolePermissions(context.role) : []),
    ...(context.permissions ?? []),
  ];
  return granted.some((permission) =>
    matchesPermission(permission.trim(), requiredPermission.trim()),
  );
}

export function assertPermission(
  context: Pick<OrgContext, 'role' | 'permissions'>,
  requiredPermission: string,
): void {
  if (!hasPermission(context, requiredPermission)) throw new AuthorizationError();
}

export function hasRole(
  context: Pick<OrgContext, 'role'>,
  roles: string | readonly string[],
): boolean {
  if (!context.role) return false;
  const allowed = typeof roles === 'string' ? [roles] : roles;
  const actual = normalizeRole(context.role);
  return allowed.some((role) => normalizeRole(role) === actual);
}

export function assertRole(
  context: Pick<OrgContext, 'role'>,
  roles: string | readonly string[],
): void {
  if (!hasRole(context, roles))
    throw new AuthorizationError('A required organization role is missing.');
}
