import { Prisma } from "../../../generated/prisma/client";

import { invoiceSelect } from "../selects/invoicing.selects";
import { InvariantViolationError } from "./errors";

function calculateTaxes(
  subtotal: string | Prisma.Decimal,
  taxRate: string | Prisma.Decimal,
) {
  const amount = new Prisma.Decimal(subtotal);
  const rate = new Prisma.Decimal(taxRate);
  if (amount.isNegative() || rate.isNegative() || rate.greaterThan(1)) {
    throw new InvariantViolationError("Invoice tax inputs are invalid.");
  }
  return amount.mul(rate).toDecimalPlaces(4);
}

export function calculateInvoiceTotals(
  lines: Array<{ quantity: string; unitPrice: string; taxRate: string }>,
) {
  let subtotal = new Prisma.Decimal(0);
  let taxTotal = new Prisma.Decimal(0);
  const calculatedLines = lines.map((line) => {
    const quantity = new Prisma.Decimal(line.quantity);
    const unitPrice = new Prisma.Decimal(line.unitPrice);
    if (quantity.lessThanOrEqualTo(0) || unitPrice.isNegative()) {
      throw new InvariantViolationError("Invoice line amounts are invalid.");
    }
    const lineSubtotal = quantity.mul(unitPrice).toDecimalPlaces(4);
    const lineTax = calculateTaxes(lineSubtotal, line.taxRate);
    const lineTotal = lineSubtotal.add(lineTax);
    subtotal = subtotal.add(lineSubtotal);
    taxTotal = taxTotal.add(lineTax);
    return {
      quantity,
      unitPrice,
      taxRate: new Prisma.Decimal(line.taxRate),
      lineSubtotal,
      lineTax,
      lineTotal,
    };
  });
  return {
    lines: calculatedLines,
    subtotal,
    taxTotal,
    total: subtotal.add(taxTotal),
  };
}

export async function createInvoiceTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    createdByMembershipId: string;
    customerName: string;
    customerEmail?: string | null;
    currency: string;
    issuedAt?: Date | null;
    dueAt?: Date | null;
    lines: Array<{
      description: string;
      quantity: string;
      unitPrice: string;
      taxRate: string;
    }>;
  },
) {
  if (input.lines.length === 0) {
    throw new InvariantViolationError(
      "An invoice must contain at least one line.",
    );
  }

  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.organizationId}))`;
  const latest = await tx.invoice.aggregate({
    where: {
      organizationId: input.organizationId,
    },
    _max: {
      number: true,
    },
  });

  const number = (latest._max.number ?? 0) + 1;

  const calculated = calculateInvoiceTotals(input.lines);
  const lines = input.lines.map((line, index) => {
    const totals = calculated.lines[index]!;
    return {
      organizationId: input.organizationId,
      position: index + 1,
      description: line.description,
      quantity: totals.quantity,
      unitPrice: totals.unitPrice,
      taxRate: totals.taxRate,
      lineSubtotal: totals.lineSubtotal,
      lineTax: totals.lineTax,
      lineTotal: totals.lineTotal,
    };
  });

  return tx.invoice.create({
    data: {
      organizationId: input.organizationId,
      createdByMembershipId: input.createdByMembershipId,
      number,
      customerName: input.customerName,
      customerEmail: input.customerEmail ?? null,
      currency: input.currency,
      issuedAt: input.issuedAt ?? null,
      dueAt: input.dueAt ?? null,
      subtotal: calculated.subtotal,
      taxTotal: calculated.taxTotal,
      total: calculated.total,
      lines: {
        create: lines,
      },
    },
    select: invoiceSelect,
  });
}
