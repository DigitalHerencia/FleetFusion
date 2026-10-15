import type { AccessContext, AppRole, Permission } from "../../types/access";

export const permissions = [
  "organization:read",
  "organization:write",
  "crm:read",
  "crm:write",
  "projects:read",
  "projects:write",
  "support:read",
  "support:write",
  "marketing:read",
  "marketing:write",
  "invoicing:read",
  "invoicing:write",
  "social:read",
  "social:write",
  "ai:read",
  "ai:write",
  "portal:read",
  "portal:write",
  "portal:billing",
  "admin:audit",
  "admin:records",
  "admin:users",
  "admin:bulk",
] as const;

const grants: Record<AppRole, ReadonlySet<Permission>> = {
  OWNER: new Set(permissions),
  ADMIN: new Set(permissions),

  MANAGER: new Set([
    "organization:read",
    "crm:read",
    "crm:write",
    "projects:read",
    "projects:write",
    "support:read",
    "support:write",
    "marketing:read",
    "marketing:write",
    "invoicing:read",
    "social:read",
    "social:write",
    "ai:read",
    "ai:write",
    "portal:read",
    "portal:write",
  ]),

  MEMBER: new Set([
    "organization:read",
    "crm:read",
    "crm:write",
    "projects:read",
    "projects:write",
    "support:read",
    "support:write",
    "marketing:read",
    "social:read",
    "social:write",
    "ai:read",
    "ai:write",
    "portal:read",
  ]),

  BILLING: new Set([
    "organization:read",
    "invoicing:read",
    "invoicing:write",
    "portal:read",
    "portal:billing",
  ]),

  SUPPORT: new Set([
    "organization:read",
    "support:read",
    "support:write",
    "crm:read",
    "portal:read",
  ]),

  CLIENT: new Set([
    "organization:read",
    "support:read",
    "support:write",
    "portal:read",
  ]),

  VIEWER: new Set([
    "organization:read",
    "crm:read",
    "projects:read",
    "support:read",
    "marketing:read",
    "invoicing:read",
    "social:read",
    "ai:read",
    "portal:read",
  ]),
};

export class AuthorizationError extends Error {
  constructor(permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = "AuthorizationError";
  }
}

export function hasPermission(
  context: AccessContext,
  permission: Permission,
): boolean {
  return grants[context.role].has(permission);
}

export function assertPermission(
  context: AccessContext,
  permission: Permission,
): void {
  if (!hasPermission(context, permission)) {
    throw new AuthorizationError(permission);
  }
}
