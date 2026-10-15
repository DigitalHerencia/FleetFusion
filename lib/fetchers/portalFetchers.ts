import "server-only";

import { assertPermission, hasPermission } from "../authz/permissions";
import {
  toPortalBillingSubscriptionDTO,
  toPortalDocumentDTO,
  toPortalInvoiceDTO,
} from "../db/dto/portal.dto";
import {
  portalBillingSelect,
  portalDocumentSelect,
  portalInvoiceSelect,
} from "../db/selects/portal.selects";
import { withAuthenticatedRead } from "../db/tenant";

export async function getPortalDocuments(limit = 100) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "portal:read");

    const clientOnly = access.role === "CLIENT";

    const rows = await tx.portalDocument.findMany({
      where: {
        organizationId: access.organizationId,
        ...(clientOnly
          ? {
              clientVisible: true,
              status: {
                not: "ARCHIVED",
              },
            }
          : {}),
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: Math.min(Math.max(limit, 1), 200),
      select: portalDocumentSelect,
    });

    return rows.map(toPortalDocumentDTO);
  });
}

export async function getPortalBilling() {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "portal:billing");
    const [subscription, invoices] = await Promise.all([
      tx.billingSubscription.findUnique({
        where: { organizationId: access.organizationId },
        select: portalBillingSelect,
      }),
      tx.invoice.findMany({
        where: { organizationId: access.organizationId },
        orderBy: { createdAt: "desc" },
        take: 25,
        select: portalInvoiceSelect,
      }),
    ]);
    return {
      subscription: subscription
        ? toPortalBillingSubscriptionDTO(subscription)
        : null,
      invoices: invoices.map(toPortalInvoiceDTO),
    };
  });
}

export async function getPortalWriteAccess() {
  return withAuthenticatedRead(async (_tx, access) => {
    return hasPermission(access, "portal:write");
  });
}

export async function getPortalAssets() {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "portal:write");
    return tx.asset.findMany({
      where: { organizationId: access.organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, filename: true },
    });
  });
}

export async function getPortalDocument(documentId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "portal:read");
    const row = await tx.portalDocument.findFirst({
      where: {
        id: documentId,
        organizationId: access.organizationId,
        ...(access.role === "CLIENT"
          ? { clientVisible: true, status: { not: "ARCHIVED" as const } }
          : {}),
      },
      select: portalDocumentSelect,
    });
    return row ? toPortalDocumentDTO(row) : null;
  });
}
