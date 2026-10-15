"use server";

import { uploadWorkspaceAssetWorkflow } from "@/lib/workflows/assetWorkflows";
import { organizationSettingsSchema } from "@/schemas/commonSchemas";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { toOrganizationDTO } from "@/lib/db/dto/organization.dto";
import { organizationOverviewSelect } from "@/lib/db/selects/organization.selects";
import { withTenantTransaction } from "@/lib/db/tenant";

export async function updateOrganizationSettings(rawInput: unknown) {
  const input = organizationSettingsSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "organization:write");
    await tx.organizationSettings.upsert({
      where: { organizationId: access.organizationId },
      update: {
        timezone: input.timezone,
        locale: input.locale,
        defaultCurrency: input.defaultCurrency,
      },
      create: {
        organizationId: access.organizationId,
        timezone: input.timezone,
        locale: input.locale,
        defaultCurrency: input.defaultCurrency,
      },
    });
    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "organization.settings.updated",
        resourceType: "Organization",
        resourceId: access.organizationId,
      },
    });
    const record = await tx.organization.findFirstOrThrow({
      where: { id: access.organizationId },
      select: organizationOverviewSelect,
    });
    return toOrganizationDTO(record);
  });
}

export async function uploadWorkspaceAsset(formData: FormData) {
  return uploadWorkspaceAssetWorkflow(formData);
}
