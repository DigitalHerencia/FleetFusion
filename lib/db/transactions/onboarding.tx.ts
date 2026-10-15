import type { Prisma } from "@/generated/prisma/client";
import type { AccessContext } from "@/types/access";
import { assertPermission } from "@/lib/authz/permissions";

export async function completeOnboardingTx(
  tx: Prisma.TransactionClient,
  access: AccessContext,
  name: string,
) {
  // Serialize repeated submissions for this membership, including across tabs.
  await tx.$queryRaw`SELECT id FROM "Membership" WHERE id = ${access.membershipId}::uuid AND "organizationId" = ${access.organizationId}::uuid FOR UPDATE`;
  const where = {
    organizationId: access.organizationId,
    actorUserId: access.userId,
    action: "membership.onboarding.completed",
    resourceType: "Membership",
    resourceId: access.membershipId,
  };
  if (await tx.auditEvent.findFirst({ where, select: { id: true } })) return;
  const organization = await tx.organization.findFirstOrThrow({
    where: { id: access.organizationId },
    select: { name: true },
  });
  if (organization.name !== name) {
    assertPermission(access, "organization:write");
    await tx.organization.update({
      where: { id: access.organizationId },
      data: { name },
    });
  }
  await tx.auditEvent.create({ data: where });
}
