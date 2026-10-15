import type { Prisma } from "@/generated/prisma/client";

import { ResourceNotFoundError } from "./errors";

export async function assignCrmRecordTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    recordType: "account" | "contact" | "deal";
    recordId: string;
    ownerMembershipId: string;
  },
) {
  const owner = await tx.membership.findFirst({
    where: {
      id: input.ownerMembershipId,
      organizationId: input.organizationId,
      status: "ACTIVE",
    },
    select: { id: true },
  });
  if (!owner) throw new ResourceNotFoundError("CRM owner membership");
  const where = { id: input.recordId, organizationId: input.organizationId };
  const data = { ownerMembershipId: owner.id };
  const result =
    input.recordType === "account"
      ? await tx.crmAccount.updateMany({ where, data })
      : input.recordType === "contact"
        ? await tx.crmContact.updateMany({ where, data })
        : await tx.crmDeal.updateMany({ where, data });
  if (result.count !== 1) throw new ResourceNotFoundError("CRM record");
  return {
    recordType: input.recordType,
    recordId: input.recordId,
    ownerMembershipId: owner.id,
  };
}
