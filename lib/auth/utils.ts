// lib/auth/utils.ts
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/database/db';
import { SystemRoles } from '@/types/abac';

/**
 * Utility to get the current organization ID from the session.
 * This is a server-side utility.
 */
export async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  return orgId ? orgId : null;
}

/**
 * Utility to get the current user ID from the session.
 * This is a server-side utility.
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Ensure the current user is an admin of the provided organization.
 * Throws an error if the user is unauthorized or not an admin.
 */
export async function requireAdminForOrg(orgId: string): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { organizationId: true, role: true },
  });

  if (!user || user.organizationId !== orgId || user.role !== SystemRoles.ADMIN) {
    throw new Error('Forbidden');
  }

  return userId;
}

// Add other auth-related utilities if needed
