import { Prisma } from "@/generated/prisma/client";
import type { Prisma as PrismaTypes } from "@/generated/prisma/client";

import { expenseSelect, invoiceSelect } from "../selects/invoicing.selects";
import { InvariantViolationError, ResourceNotFoundError } from "./errors";

export async function submitExpenseTx(
  tx: PrismaTypes.TransactionClient,
  input: {
    organizationId: string;
    submittedByMembershipId: string;
    receiptAssetId?: string | null;
    vendor: string;
    description?: string | null;
    amount: string;
    currency: string;
    incurredAt: Date;
  },
) {
  const amount = new Prisma.Decimal(input.amount);
  if (amount.lessThanOrEqualTo(0)) {
    throw new InvariantViolationError("Expense amount must be positive.");
  }
  return tx.expense.create({
    data: {
      organizationId: input.organizationId,
      submittedByMembershipId: input.submittedByMembershipId,
      receiptAssetId: input.receiptAssetId ?? null,
      vendor: input.vendor,
      description: input.description ?? null,
      amount,
      currency: input.currency,
      incurredAt: input.incurredAt,
      status: "SUBMITTED",
    },
    select: expenseSelect,
  });
}

export async function approveExpenseTx(
  tx: PrismaTypes.TransactionClient,
  input: { organizationId: string; expenseId: string },
) {
  const result = await tx.expense.updateMany({
    where: {
      id: input.expenseId,
      organizationId: input.organizationId,
      status: "SUBMITTED",
    },
    data: { status: "APPROVED" },
  });
  if (result.count !== 1) {
    const exists = await tx.expense.findFirst({
      where: { id: input.expenseId, organizationId: input.organizationId },
      select: { id: true },
    });
    if (!exists) throw new ResourceNotFoundError("Expense");
    throw new InvariantViolationError(
      "Only a submitted expense can be approved.",
    );
  }
  return tx.expense.findFirstOrThrow({
    where: { id: input.expenseId, organizationId: input.organizationId },
    select: expenseSelect,
  });
}

export async function approveInvoiceTx(
  tx: PrismaTypes.TransactionClient,
  input: {
    organizationId: string;
    approverMembershipId: string;
    invoiceId: string;
    expectedVersion: number;
  },
) {
  const result = await tx.invoice.updateMany({
    where: {
      id: input.invoiceId,
      organizationId: input.organizationId,
      status: "DRAFT",
      version: input.expectedVersion,
      approvedAt: null,
    },
    data: {
      approvedAt: new Date(),
      approvedByMembershipId: input.approverMembershipId,
      version: { increment: 1 },
    },
  });
  if (result.count !== 1) {
    throw new InvariantViolationError(
      "Only an unapproved draft invoice can be approved.",
    );
  }
  return tx.invoice.findFirstOrThrow({
    where: { id: input.invoiceId, organizationId: input.organizationId },
    select: invoiceSelect,
  });
}
