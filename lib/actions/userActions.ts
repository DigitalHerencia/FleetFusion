'use server';
/**
 * User management server actions.
 */
import db from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';
import { sendInvitationEmail } from '@/lib/email/mailer';
import crypto from 'crypto';
import type { UserInvitationResult } from '@/types/users';

// Invite user: create pending membership and send invite (implementation stub)
export async function inviteUserAction(
  orgId: string,
  email: string,
  role: string,
): Promise<UserInvitationResult> {
  try {
    // Find or create user by email
    let user = await db.user.findFirst({ where: { email } });
    if (!user) {
      user = await db.user.create({
        data: { id: crypto.randomUUID(), email, isActive: false },
      });
    }
    // Create pending membership
    await db.organizationMembership.upsert({
      where: {
        organizationId_userId: { organizationId: orgId, userId: user.id },
      },
      update: { role, updatedAt: new Date() },
      create: {
        id: crypto.randomUUID(),
        organizationId: orgId,
        userId: user.id,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const token = crypto.randomUUID();
    await db.organizationInvitation.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: orgId,
        email,
        role,
        token,
        status: 'pending',
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const link = `${baseUrl}/accept-invitation?token=${token}`;
    await sendInvitationEmail(email, link);

    return { success: true, userId: user.id, invitationToken: token };
  } catch (error) {
    return handleError(error, 'Invite User Action');
  }
}

// Update user role in custom orgs using Prisma
export async function updateUserRoleAction(orgId: string, userId: string, newRole: string) {
  try {
    // Update membership role
    await db.organizationMembership.update({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      data: { role: newRole, updatedAt: new Date() },
    });
    return { success: true };
  } catch (error) {
    return handleError(error, 'Update User Role');
  }
}
