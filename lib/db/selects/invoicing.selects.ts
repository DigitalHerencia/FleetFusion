import type { Prisma } from "../../../generated/prisma/client";

export const invoiceSelect = {
  id: true,
  number: true,
  customerName: true,
  customerEmail: true,
  currency: true,
  subtotal: true,
  taxTotal: true,
  total: true,
  status: true,
  issuedAt: true,
  dueAt: true,
  paidAt: true,
  approvedAt: true,
  approvedBy: {
    select: {
      id: true,
      user: { select: { displayName: true } },
    },
  },
  version: true,
  lines: {
    orderBy: {
      position: "asc",
    },
    select: {
      id: true,
      position: true,
      description: true,
      quantity: true,
      unitPrice: true,
      taxRate: true,
      lineSubtotal: true,
      lineTax: true,
      lineTotal: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InvoiceSelect;

export type InvoiceRecord = Prisma.InvoiceGetPayload<{
  select: typeof invoiceSelect;
}>;

export const expenseSelect = {
  updatedAt: true,
  id: true,
  vendor: true,
  description: true,
  amount: true,
  currency: true,
  incurredAt: true,
  status: true,
  submittedBy: { select: { user: { select: { displayName: true } } } },
} satisfies Prisma.ExpenseSelect;

export type ExpenseRecord = Prisma.ExpenseGetPayload<{
  select: typeof expenseSelect;
}>;
