import type {
  AdminMembershipDTO,
  AdminProviderStateDTO,
  AuditEventDTO,
} from "../../../types/adminTypes";
import type {
  AdminMembershipRecord,
  AdminProviderSubscriptionRecord,
  AuditEventRecord,
} from "../selects/admin.selects";

export function toAuditEventDTO(record: AuditEventRecord): AuditEventDTO {
  return {
    id: record.id,
    action: record.action,
    resourceType: record.resourceType,
    resourceId: record.resourceId,
    metadata: record.metadata,
    actor: record.actor
      ? {
          id: record.actor.id,
          displayName: record.actor.displayName,
          email: record.actor.email,
        }
      : null,
    createdAt: record.createdAt.toISOString(),
  };
}

export function toAdminMembershipDTO(
  record: AdminMembershipRecord,
): AdminMembershipDTO {
  return {
    id: record.id,
    role: record.role,
    status: record.status,
    user: record.user,
    createdAt: record.createdAt.toISOString(),
  };
}

export function toAdminProviderStateDTO(
  record: AdminProviderSubscriptionRecord,
): AdminProviderStateDTO {
  return {
    ...record,
    currentPeriodEnd: record.currentPeriodEnd?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
