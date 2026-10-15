import type {
  CrmAccountDTO,
  CrmContactDTO,
  CrmDealDTO,
  CrmDealSummaryDTO,
} from "@/types/crmTypes";
import type {
  CrmAccountRecord,
  CrmContactRecord,
  CrmDealDetailRecord,
  CrmDealSummaryRecord,
} from "@/lib/db/selects/crm.selects";

export function toCrmContactDTO(record: CrmContactRecord): CrmContactDTO {
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    phone: record.phone,
    title: record.title,
    status: record.status,
    account: record.account,
    owner: record.owner
      ? {
          membershipId: record.owner.id,
          displayName: record.owner.user.displayName,
        }
      : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toCrmAccountDTO(record: CrmAccountRecord): CrmAccountDTO {
  return {
    id: record.id,
    name: record.name,
    website: record.website,
    industry: record.industry,
    status: record.status,
    notes: record.notes,
    contactCount: record._count.contacts,
    dealCount: record._count.deals,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toCrmDealSummaryDTO(
  record: CrmDealSummaryRecord,
): CrmDealSummaryDTO {
  return {
    id: record.id,
    name: record.name,
    stage: record.stage,
    value: record.value.toString(),
    currency: record.currency,
    probability: record.probability,
    expectedCloseDate: record.expectedCloseDate?.toISOString() ?? null,
    version: record.version,
    account: {
      id: record.account.id,
      name: record.account.name,
    },
    owner: record.owner
      ? {
          id: record.owner.id,
          displayName: record.owner.user.displayName,
        }
      : null,
  };
}

export function toCrmDealDTO(record: CrmDealDetailRecord): CrmDealDTO {
  return {
    ...toCrmDealSummaryDTO(record),
    primaryContact: record.primaryContact
      ? {
          id: record.primaryContact.id,
          firstName: record.primaryContact.firstName,
          lastName: record.primaryContact.lastName,
          email: record.primaryContact.email,
        }
      : null,
    closedAt: record.closedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
