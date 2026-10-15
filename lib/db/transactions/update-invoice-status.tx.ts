import type { InvoiceStatus, Prisma } from "../../../generated/prisma/client";

import { invoiceSelect } from "../selects/invoicing.selects";
import { ConcurrencyConflictError } from "./errors";

export async function updateInvoiceStatusTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    invoiceId: string;
    status: InvoiceStatus;
    expectedVersion: number;
  },
) {
  const result = await tx.invoice.updateMany({
    where: {
      id: input.invoiceId,
      organizationId: input.organizationId,
      version: input.expectedVersion,
    },
    data: {
      status: input.status,
      paidAt: input.status === "PAID" ? new Date() : null,
      version: {
        increment: 1,
      },
    },
  });

  if (result.count !== 1) {
    throw new ConcurrencyConflictError("Invoice");
  }

  return tx.invoice.findFirstOrThrow({
    where: {
      id: input.invoiceId,
      organizationId: input.organizationId,
    },
    select: invoiceSelect,
  });
}
