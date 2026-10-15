import { randomUUID } from "node:crypto";

import type { Prisma } from "@/generated/prisma/client";
import type { ClerkUserProjection } from "@/types/integrationTypes";

function workspaceSlug(username: string | null, clerkUserId: string): string {
  const base =
    (username ?? "workspace")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "workspace";
  return `${base}-${clerkUserId.slice(-8).toLowerCase()}`;
}

export async function syncClerkUserTx(
  tx: Prisma.TransactionClient,
  user: ClerkUserProjection,
) {
  await tx.$executeRaw`SELECT set_config('app.clerk_user_id', ${user.clerkUserId}, true)`;
  const record = await tx.user.upsert({
    where: { clerkUserId: user.clerkUserId },
    create: {
      clerkUserId: user.clerkUserId,
      email: user.email,
      displayName: user.displayName,
      imageUrl: user.imageUrl,
    },
    update: {
      email: user.email,
      displayName: user.displayName,
      imageUrl: user.imageUrl,
    },
    select: { id: true },
  });
  const membership = await tx.membership.findFirst({
    where: { userId: record.id, status: "ACTIVE" },
    select: { id: true },
  });
  if (membership) return;

  const organizationId = randomUUID();
  await tx.$executeRaw`SELECT set_config('app.organization_id', ${organizationId}, true)`;
  const organization = await tx.organization.create({
    data: {
      id: organizationId,
      slug: workspaceSlug(user.username, user.clerkUserId),
      name: user.username ? `${user.username}'s Workspace` : "My Workspace",
    },
    select: { id: true },
  });
  await tx.membership.create({
    data: {
      organizationId: organization.id,
      userId: record.id,
      role: "OWNER",
      status: "ACTIVE",
    },
  });
  await tx.organizationSettings.create({
    data: { organizationId: organization.id },
  });
}

export async function anonymizeClerkUserTx(
  tx: Prisma.TransactionClient,
  clerkUserId: string,
) {
  await tx.$executeRaw`SELECT set_config('app.clerk_user_id', ${clerkUserId}, true)`;
  await tx.user.updateMany({
    where: { clerkUserId },
    data: { email: null, displayName: "Deleted user", imageUrl: null },
  });
}
