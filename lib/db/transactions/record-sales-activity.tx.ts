import type { Prisma } from "@/generated/prisma/client";

import { ResourceNotFoundError } from "./errors";

export async function recordSalesActivityTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    authoredByMembershipId: string;
    recordType: "account" | "contact" | "deal";
    recordId: string;
    kind: string;
    subject: string;
    body?: string | null;
    occurredAt: Date;
  },
) {
  const where = { id: input.recordId, organizationId: input.organizationId };
  const record =
    input.recordType === "account"
      ? await tx.crmAccount.findFirst({ where, select: { id: true } })
      : input.recordType === "contact"
        ? await tx.crmContact.findFirst({ where, select: { id: true } })
        : await tx.crmDeal.findFirst({ where, select: { id: true } });
  if (!record) throw new ResourceNotFoundError("CRM record");
  return tx.crmActivity.create({
    data: input,
    select: {
      id: true,
      recordType: true,
      recordId: true,
      kind: true,
      subject: true,
      body: true,
      occurredAt: true,
      createdAt: true,
    },
  });
}
