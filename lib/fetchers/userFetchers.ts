'use server';

import { requireAdminForOrg } from '@/lib/auth/utils';

import prisma from '@/lib/database/db';
import { type UserRole } from '@/types/auth';

export type UserWithRole = {
  id: string;
  name: string;
  role: UserRole;
};

/**
 * Retrieve all users for an organization along with their assigned roles.
 */
export async function listOrganizationUsers(
  orgId: string
): Promise<UserWithRole[]> {
  await requireAdminForOrg(orgId);

  const memberships = await prisma.organizationMembership.findMany({
    where: { organizationId: orgId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return memberships.map(m => ({
    id: m.user.id,
    name: `${m.user.firstName ?? ''} ${m.user.lastName ?? ''}`.trim(),
    role: m.role as UserRole,
  }));
}
