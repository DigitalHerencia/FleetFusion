import { auth } from '@/lib/server/auth';

export const membershipRoles = [
  'OWNER',
  'ADMIN',
  'MANAGER',
  'DISPATCHER',
  'DRIVER_MANAGER',
  'COMPLIANCE_MANAGER',
  'ANALYST',
  'BILLING',
  'MEMBER',
] as const;

export type MembershipRole = (typeof membershipRoles)[number];

const roleRank: Record<MembershipRole, number> = {
  OWNER: 100,
  ADMIN: 80,
  MANAGER: 60,
  DISPATCHER: 40,
  DRIVER_MANAGER: 40,
  COMPLIANCE_MANAGER: 40,
  ANALYST: 30,
  BILLING: 30,
  MEMBER: 10,
};

export function normalizeRole(role: string): MembershipRole | null {
  const normalized = role.trim().toUpperCase() as MembershipRole;
  return membershipRoles.includes(normalized) ? normalized : null;
}

export function hasMinimumRole(actualRole: string | undefined, minimumRole: MembershipRole) {
  const actual = actualRole ? normalizeRole(actualRole) : null;
  return actual !== null && roleRank[actual] >= roleRank[minimumRole];
}

export function canAssignRole(
  actorRole: string | undefined,
  targetRole: string,
  currentTargetRole?: string,
) {
  const actor = actorRole ? normalizeRole(actorRole) : null;
  const target = normalizeRole(targetRole);
  const current = currentTargetRole ? normalizeRole(currentTargetRole) : null;
  if (!actor || !target || target === 'OWNER') return false;
  if (current === 'OWNER') return actor === 'OWNER';
  if (actor !== 'OWNER' && actor !== 'ADMIN') return false;
  if (actor === 'ADMIN' && (target === 'ADMIN' || target === 'MANAGER')) return false;
  return true;
}

export async function requireAuthRole(minimumRole: MembershipRole) {
  const context = await auth.requireOrgContext();
  if (!hasMinimumRole(context.role, minimumRole)) {
    throw new Error('You do not have permission to perform this action.');
  }
  await auth.assertRole(minimumRole.toLowerCase());
  return context;
}
