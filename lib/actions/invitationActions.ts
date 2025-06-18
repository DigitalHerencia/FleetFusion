'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { handleError } from '@/lib/errors/handleError';
import { invitationSchema } from '@/schemas/invitations';

// See CONTRIBUTING.md#L596-L618 for validation and permission checks

export interface InvitationData {
  emailAddress: string;
  role: string;
  redirectUrl?: string;
}

export async function createOrganizationInvitation(data: InvitationData) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = invitationSchema.parse(data);

    const client = await clerkClient();
    await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      inviterUserId: userId,
      emailAddress: validated.emailAddress,
      role: validated.role,
      redirectUrl: validated.redirectUrl,
    });

    revalidatePath(`/${orgId}/settings`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Create Organization Invitation');
  }
}

export async function getOrganizationInvitations(organizationId?: string) {
  try {
    const { userId, orgId } = await auth();
    const targetOrgId = organizationId || orgId;

    if (!userId || !targetOrgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const client = await clerkClient();
    const invitations = await client.organizations.getOrganizationInvitations({
      organizationId: targetOrgId,
    });

    return { success: true, data: invitations };
  } catch (error) {
    return handleError(error, 'Get Organization Invitations');
  }
}
