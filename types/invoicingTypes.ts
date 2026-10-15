export interface InvoiceLineDTO {
  id: string;
  position: number;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  lineSubtotal: string;
  lineTax: string;
  lineTotal: string;
}
export interface InvoiceDTO {
  id: string;
  number: number;
  customerName: string;
  customerEmail: string | null;
  currency: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  status: string;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  approvedAt: string | null;
  approvedBy: {
    membershipId: string;
    displayName: string | null;
  } | null;
  version: number;
  lines: InvoiceLineDTO[];
  createdAt: string;
  updatedAt: string;
}
export interface ExpenseDTO {
  updatedAt: string;
  id: string;
  vendor: string;
  description: string | null;
  amount: string;
  currency: string;
  incurredAt: string;
  status: string;
  submitter: string | null;
}

export interface FinalizeInvoiceCommand {
  invoiceId: string;
  expectedVersion: number;
}
