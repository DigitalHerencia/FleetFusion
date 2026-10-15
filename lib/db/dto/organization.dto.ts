import type { OrganizationDTO } from "../../../types/commonTypes";
import type { OrganizationOverviewRecord } from "../selects/organization.selects";

export function toOrganizationDTO(
  record: OrganizationOverviewRecord,
): OrganizationDTO {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    imageUrl: record.imageUrl,
    timezone: record.settings?.timezone ?? "UTC",
    locale: record.settings?.locale ?? "en-US",
    defaultCurrency: record.settings?.defaultCurrency ?? "USD",
    memberCount: record._count.memberships,
  };
}
