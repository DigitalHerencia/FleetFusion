import "server-only";
import { cache } from "react";
import { withAuthenticatedRead } from "@/lib/db/tenant";
import { hasPermission } from "@/lib/authz/permissions";

// The completion event is durable and scoped to the current membership.
export const getOnboardingState = cache(async () =>
  withAuthenticatedRead(async (tx, access) => {
    const organization = await tx.organization.findFirstOrThrow({
      where: { id: access.organizationId },
      select: { name: true },
    });
    const completion = await tx.auditEvent.findFirst({
      where: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "membership.onboarding.completed",
        resourceType: "Membership",
        resourceId: access.membershipId,
      },
      select: { id: true },
    });
    return {
      completed: Boolean(completion),
      workspaceName: organization.name,
      canRename: hasPermission(access, "organization:write"),
    };
  }),
);
