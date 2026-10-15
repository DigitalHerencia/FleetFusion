import "server-only";

import { assertPermission } from "../authz/permissions";
import { toExpenseDTO, toInvoiceDTO } from "../db/dto/invoicing.dto";
import { expenseSelect, invoiceSelect } from "../db/selects/invoicing.selects";
import { withAuthenticatedRead } from "../db/tenant";

export async function getInvoices(limit = 50) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "invoicing:read");

    const rows = await tx.invoice.findMany({
      where: {
        organizationId: access.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Math.min(Math.max(limit, 1), 100),
      select: invoiceSelect,
    });

    return rows.map(toInvoiceDTO);
  });
}

export async function getInvoice(invoiceId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "invoicing:read");

    const record = await tx.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId: access.organizationId,
      },
      select: invoiceSelect,
    });

    return record ? toInvoiceDTO(record) : null;
  });
}

export async function getExpenses(limit = 100) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "invoicing:read");
    const rows = await tx.expense.findMany({
      where: { organizationId: access.organizationId },
      orderBy: { incurredAt: "desc" },
      take: Math.min(Math.max(limit, 1), 200),
      select: expenseSelect,
    });
    return rows.map(toExpenseDTO);
  });
}

export async function getExpense(expenseId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "invoicing:read");
    const row = await tx.expense.findFirst({
      where: { id: expenseId, organizationId: access.organizationId },
      select: expenseSelect,
    });
    return row ? toExpenseDTO(row) : null;
  });
}
