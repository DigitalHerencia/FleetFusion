import type {
  PortalBillingDTO,
  PortalDocumentDTO,
} from "../../../types/portalTypes";
import type {
  PortalBillingSubscriptionRecord,
  PortalDocumentRecord,
  PortalInvoiceRecord,
} from "../selects/portal.selects";

export function toPortalDocumentDTO(
  record: PortalDocumentRecord,
): PortalDocumentDTO {
  const latest = record.versions[0] ?? null;

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    status: record.status,
    clientVisible: record.clientVisible,
    currentVersionNumber: record.currentVersionNumber,
    version: record.version,
    latestVersion: latest
      ? {
          id: latest.id,
          versionNumber: latest.versionNumber,
          filename: latest.asset.filename,
          contentType: latest.asset.contentType,
          byteSize: latest.asset.byteSize.toString(),
          createdAt: latest.createdAt.toISOString(),
        }
      : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toPortalBillingSubscriptionDTO(
  record: PortalBillingSubscriptionRecord,
): NonNullable<PortalBillingDTO["subscription"]> {
  return {
    ...record,
    currentPeriodEnd: record.currentPeriodEnd?.toISOString() ?? null,
  };
}

export function toPortalInvoiceDTO(
  record: PortalInvoiceRecord,
): PortalBillingDTO["invoices"][number] {
  return {
    ...record,
    total: record.total.toString(),
    dueAt: record.dueAt?.toISOString() ?? null,
  };
}
