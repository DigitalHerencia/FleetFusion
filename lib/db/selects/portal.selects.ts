import type { Prisma } from "../../../generated/prisma/client";

export const portalDocumentSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  clientVisible: true,
  currentVersionNumber: true,
  version: true,
  versions: {
    orderBy: {
      versionNumber: "desc",
    },
    take: 1,
    select: {
      id: true,
      versionNumber: true,
      createdAt: true,
      asset: {
        select: {
          filename: true,
          contentType: true,
          byteSize: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PortalDocumentSelect;

export type PortalDocumentRecord = Prisma.PortalDocumentGetPayload<{
  select: typeof portalDocumentSelect;
}>;

export const portalBillingSelect = {
  planKey: true,
  status: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
} satisfies Prisma.BillingSubscriptionSelect;

export type PortalBillingSubscriptionRecord =
  Prisma.BillingSubscriptionGetPayload<{
    select: typeof portalBillingSelect;
  }>;

export const portalInvoiceSelect = {
  id: true,
  number: true,
  customerName: true,
  status: true,
  total: true,
  currency: true,
  dueAt: true,
} satisfies Prisma.InvoiceSelect;

export type PortalInvoiceRecord = Prisma.InvoiceGetPayload<{
  select: typeof portalInvoiceSelect;
}>;
