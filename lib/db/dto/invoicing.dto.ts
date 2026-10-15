import type { ExpenseDTO, InvoiceDTO } from "../../../types/invoicingTypes";
import type {
  ExpenseRecord,
  InvoiceRecord,
} from "../selects/invoicing.selects";

export function toExpenseDTO(record: ExpenseRecord): ExpenseDTO {
  return {
    updatedAt: record.updatedAt.toISOString(),
    id: record.id,
    vendor: record.vendor,
    description: record.description,
    amount: record.amount.toString(),
    currency: record.currency,
    incurredAt: record.incurredAt.toISOString(),
    status: record.status,
    submitter: record.submittedBy?.user.displayName ?? null,
  };
}

export function toInvoiceDTO(record: InvoiceRecord): InvoiceDTO {
  return {
    id: record.id,
    number: record.number,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    currency: record.currency,
    subtotal: record.subtotal.toString(),
    taxTotal: record.taxTotal.toString(),
    total: record.total.toString(),
    status: record.status,
    issuedAt: record.issuedAt?.toISOString() ?? null,
    dueAt: record.dueAt?.toISOString() ?? null,
    paidAt: record.paidAt?.toISOString() ?? null,
    approvedAt: record.approvedAt?.toISOString() ?? null,
    approvedBy: record.approvedBy
      ? {
          membershipId: record.approvedBy.id,
          displayName: record.approvedBy.user.displayName,
        }
      : null,
    version: record.version,
    lines: record.lines.map((line) => ({
      id: line.id,
      position: line.position,
      description: line.description,
      quantity: line.quantity.toString(),
      unitPrice: line.unitPrice.toString(),
      taxRate: line.taxRate.toString(),
      lineSubtotal: line.lineSubtotal.toString(),
      lineTax: line.lineTax.toString(),
      lineTotal: line.lineTotal.toString(),
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
