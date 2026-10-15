import type { MembershipRole } from "@/generated/prisma/enums";
import type { AppRole } from "../../types/access";

/** Canonical application role vocabulary. Runtime schemas and type aliases derive from this list. */
export const appRoles = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MEMBER",
  "BILLING",
  "SUPPORT",
  "CLIENT",
  "VIEWER",
] as const satisfies readonly MembershipRole[];

type MissingPersistenceRole = Exclude<
  MembershipRole,
  (typeof appRoles)[number]
>;
const membershipRoleCoverage: MissingPersistenceRole extends never
  ? true
  : never = true;
void membershipRoleCoverage;

const privilegedRoles = new Set<AppRole>(["OWNER", "ADMIN"]);

export function isAppRole(value: string): value is AppRole {
  return appRoles.some((role) => role === value);
}

export function isPrivilegedRole(role: AppRole): boolean {
  return privilegedRoles.has(role);
}
