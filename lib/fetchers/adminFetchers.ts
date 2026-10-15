import "server-only";

import { assertPermission } from "../authz/permissions";
import { toAdminMembershipDTO, toAuditEventDTO } from "../db/dto/admin.dto";
import {
  adminMembershipSelect,
  auditEventSelect,
} from "../db/selects/admin.selects";
import { withAuthenticatedRead } from "../db/tenant";

export async function getAuditEvents(limit = 100) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "admin:audit");

    const rows = await tx.auditEvent.findMany({
      where: {
        organizationId: access.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Math.min(Math.max(limit, 1), 250),
      select: auditEventSelect,
    });

    return rows.map(toAuditEventDTO);
  });
}

export async function getAdminMemberships() {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "admin:users");
    const rows = await tx.membership.findMany({
      where: { organizationId: access.organizationId },
      orderBy: { createdAt: "asc" },
      select: adminMembershipSelect,
    });
    return rows.map(toAdminMembershipDTO);
  });
}

export async function getAdminRecordSummary() {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "admin:records");
    const [
      contacts,
      projects,
      tickets,
      campaigns,
      invoices,
      socialPosts,
      generations,
      documents,
    ] = await Promise.all([
      tx.crmContact.count({ where: { organizationId: access.organizationId } }),
      tx.project.count({ where: { organizationId: access.organizationId } }),
      tx.supportTicket.count({
        where: { organizationId: access.organizationId },
      }),
      tx.campaign.count({ where: { organizationId: access.organizationId } }),
      tx.invoice.count({ where: { organizationId: access.organizationId } }),
      tx.socialPost.count({ where: { organizationId: access.organizationId } }),
      tx.aiGeneration.count({
        where: { organizationId: access.organizationId },
      }),
      tx.portalDocument.count({
        where: { organizationId: access.organizationId },
      }),
    ]);
    return [
      ["CRM contacts", contacts],
      ["Projects", projects],
      ["Support tickets", tickets],
      ["Campaigns", campaigns],
      ["Invoices", invoices],
      ["Social posts", socialPosts],
      ["AI generations", generations],
      ["Portal documents", documents],
    ].map(([resource, count]) => ({
      resource: String(resource),
      count: Number(count),
    }));
  });
}
