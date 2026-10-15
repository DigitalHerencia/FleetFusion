"use server";

import {
  crmAccountFormSchema,
  updateCrmAccountSchema,
  archiveContactSchema,
  createContactSchema,
  createCrmDealSchema,
  updateContactSchema,
  updateCrmDealStageSchema,
} from "@/schemas/crmSchemas";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { authorizeOwnedOrAssignedWrite } from "@/lib/authz/policies";
import {
  toCrmAccountDTO,
  toCrmContactDTO,
  toCrmDealDTO,
} from "@/lib/db/dto/crm.dto";
import {
  crmAccountSelect,
  crmContactAccessSelect,
  crmContactSelect,
  crmDealDetailSelect,
} from "@/lib/db/selects/crm.selects";
import { withTenantTransaction } from "@/lib/db/tenant";
import {
  ConcurrencyConflictError,
  ResourceNotFoundError,
} from "@/lib/db/transactions/errors";
import { updateDealStageTx } from "@/lib/db/transactions/update-deal-stage.tx";

export async function createCrmDeal(rawInput: unknown) {
  const input = createCrmDealSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "crm:write");
    const account = await tx.crmAccount.findFirst({
      where: {
        id: input.accountId,
        organizationId: access.organizationId,
        archivedAt: null,
      },
      select: { id: true },
    });
    if (!account) throw new ResourceNotFoundError("CRM account");
    if (
      input.primaryContactId &&
      !(await tx.crmContact.findFirst({
        where: {
          id: input.primaryContactId,
          organizationId: access.organizationId,
          archivedAt: null,
        },
        select: { id: true },
      }))
    )
      throw new ResourceNotFoundError("CRM contact");
    if (
      input.ownerMembershipId &&
      !(await tx.membership.findFirst({
        where: {
          id: input.ownerMembershipId,
          organizationId: access.organizationId,
          status: "ACTIVE",
        },
        select: { id: true },
      }))
    )
      throw new ResourceNotFoundError("CRM owner");
    const record = await tx.crmDeal.create({
      data: {
        organizationId: access.organizationId,
        accountId: input.accountId,
        primaryContactId: input.primaryContactId ?? null,
        ownerMembershipId: input.ownerMembershipId ?? access.membershipId,
        name: input.name,
        value: input.value,
        currency: input.currency,
        probability: input.probability,
        expectedCloseDate: input.expectedCloseDate ?? null,
      },
      select: crmDealDetailSelect,
    });
    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "crm.deal.created",
        resourceType: "CrmDeal",
        resourceId: record.id,
      },
    });
    return toCrmDealDTO(record);
  });
}

export async function updateCrmDealStage(rawInput: unknown) {
  const input = updateCrmDealStageSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "crm:write");
    const record = await updateDealStageTx(tx, {
      organizationId: access.organizationId,
      dealId: input.dealId,
      stage: input.stage,
      expectedVersion: input.expectedVersion,
    });
    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "crm.deal.stage_updated",
        resourceType: "CrmDeal",
        resourceId: record.id,
        metadata: { stage: record.stage, version: record.version },
      },
    });
    return toCrmDealDTO(record);
  });
}

export async function createContact(rawInput: unknown) {
  const input = createContactSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "crm:write");
    const record = await tx.crmContact.create({
      data: {
        organizationId: access.organizationId,
        ownerMembershipId: access.membershipId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email || null,
        phone: input.phone || null,
        title: input.title || null,
        status: input.status,
      },
      select: crmContactSelect,
    });
    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "crm.contact.created",
        resourceType: "CrmContact",
        resourceId: record.id,
      },
    });
    return toCrmContactDTO(record);
  });
}

export async function updateContact(rawInput: unknown) {
  const input = updateContactSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    const existing = await tx.crmContact.findFirst({
      where: {
        id: input.contactId,
        organizationId: access.organizationId,
        archivedAt: null,
      },
      select: crmContactAccessSelect,
    });
    if (!existing) throw new ResourceNotFoundError("CRM contact");
    authorizeOwnedOrAssignedWrite(access, "crm:write", {
      kind: "crm",
      organizationId: existing.organizationId,
      ownerMembershipId: existing.ownerMembershipId,
    });
    if (existing.updatedAt.getTime() !== input.expectedUpdatedAt.getTime())
      throw new ConcurrencyConflictError("CRM contact");
    const result = await tx.crmContact.updateMany({
      where: {
        id: existing.id,
        organizationId: access.organizationId,
        archivedAt: null,
        updatedAt: input.expectedUpdatedAt,
      },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email || null,
        phone: input.phone || null,
        title: input.title || null,
        status: input.status,
      },
    });
    if (result.count !== 1) throw new ConcurrencyConflictError("CRM contact");
    const record = await tx.crmContact.findFirst({
      where: {
        id: existing.id,
        organizationId: access.organizationId,
        archivedAt: null,
      },
      select: crmContactSelect,
    });
    if (!record) throw new ResourceNotFoundError("CRM contact");
    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "crm.contact.updated",
        resourceType: "CrmContact",
        resourceId: record.id,
      },
    });
    return toCrmContactDTO(record);
  });
}

export async function archiveContact(rawInput: unknown) {
  const input = archiveContactSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    const existing = await tx.crmContact.findFirst({
      where: {
        id: input.contactId,
        organizationId: access.organizationId,
        archivedAt: null,
      },
      select: crmContactAccessSelect,
    });
    if (!existing) throw new ResourceNotFoundError("CRM contact");
    authorizeOwnedOrAssignedWrite(access, "crm:write", {
      kind: "crm",
      organizationId: existing.organizationId,
      ownerMembershipId: existing.ownerMembershipId,
    });
    if (existing.updatedAt.getTime() !== input.expectedUpdatedAt.getTime())
      throw new ConcurrencyConflictError("CRM contact");
    const result = await tx.crmContact.updateMany({
      where: {
        id: existing.id,
        organizationId: access.organizationId,
        archivedAt: null,
        updatedAt: input.expectedUpdatedAt,
      },
      data: { archivedAt: new Date() },
    });
    if (result.count !== 1) throw new ConcurrencyConflictError("CRM contact");
    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "crm.contact.archived",
        resourceType: "CrmContact",
        resourceId: existing.id,
      },
    });
    return { id: existing.id };
  });
}

export async function createCrmAccount(rawInput: unknown) {
  const input = crmAccountFormSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "crm:write");
    const record = await tx.crmAccount.create({
      data: {
        organizationId: access.organizationId,
        ownerMembershipId: access.membershipId,
        name: input.name,
        website: input.website || null,
        industry: input.industry || null,
        notes: input.notes || null,
      },
      select: crmAccountSelect,
    });
    return toCrmAccountDTO(record);
  });
}
export async function updateCrmAccount(rawInput: unknown) {
  const input = updateCrmAccountSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    const existing = await tx.crmAccount.findFirst({
      where: {
        id: input.accountId,
        organizationId: access.organizationId,
        archivedAt: null,
      },
      select: { organizationId: true, ownerMembershipId: true },
    });
    if (!existing) throw new ResourceNotFoundError("Account");
    authorizeOwnedOrAssignedWrite(access, "crm:write", {
      kind: "crm",
      ...existing,
    });
    const result = await tx.crmAccount.updateMany({
      where: {
        id: input.accountId,
        organizationId: access.organizationId,
        updatedAt: input.expectedUpdatedAt,
        archivedAt: null,
      },
      data: {
        name: input.name,
        website: input.website || null,
        industry: input.industry || null,
        notes: input.notes || null,
      },
    });
    if (result.count !== 1) throw new ConcurrencyConflictError("Account");
    return toCrmAccountDTO(
      await tx.crmAccount.findFirstOrThrow({
        where: { id: input.accountId, organizationId: access.organizationId },
        select: crmAccountSelect,
      }),
    );
  });
}
