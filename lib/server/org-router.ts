import { auth as clerkAuth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';
import type { OrgContext } from '@/lib/server/auth';
import { getPermissionsFromClaims } from '@/lib/server/clerk-session-claims';
import { getPermissionsForRole } from '@/lib/server/rbac';

export class OrganizationAuthorizationError extends Error {
  constructor(message = 'An active organization membership is required.') {
    super(message);
    this.name = 'OrganizationAuthorizationError';
  }
}

export async function requireOrgContext(): Promise<OrgContext> {
  const testContext = globalThis.__TEST_AUTH_CONTEXT__;
  if (testContext) {
    if (!testContext.orgId.trim() || !testContext.userId.trim()) {
      throw new OrganizationAuthorizationError();
    }
    return testContext;
  }

  const session = await clerkAuth();
  if (!session.userId || !session.orgId) throw new OrganizationAuthorizationError();

  const user = await prisma.user.findFirst({
    where: { externalId: session.userId, status: 'ACTIVE' },
    select: { id: true },
  });
  if (!user) throw new OrganizationAuthorizationError();

  const membership = await prisma.organizationMembership.findFirst({
    where: {
      organizationId: session.orgId,
      userId: user.id,
      status: 'ACTIVE',
      organization: { isActive: true },
    },
    select: { role: true },
  });
  if (!membership) throw new OrganizationAuthorizationError();

  const role = membership.role.toLowerCase();
  const permissions = [
    ...new Set([
      ...getPermissionsForRole(membership.role),
      ...getPermissionsFromClaims(session.sessionClaims),
    ]),
  ];

  return { orgId: session.orgId, userId: user.id, role, permissions };
}

export function organizationWhere<Where extends object>(
  context: Pick<OrgContext, 'orgId'>,
  where: Where,
): Where & { organizationId: string } {
  if (!context.orgId.trim()) throw new OrganizationAuthorizationError();
  return { ...where, organizationId: context.orgId } as Where & { organizationId: string };
}

export async function withOrgContext<Result>(
  callback: (context: OrgContext) => Result | Promise<Result>,
): Promise<Result> {
  return callback(await requireOrgContext());
}
