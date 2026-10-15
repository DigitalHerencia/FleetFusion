import "server-only";
import { readPrivateBlob } from "@/lib/integrations/vercel-blob/download";
import { randomUUID } from "node:crypto";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { withTenantTransaction } from "@/lib/db/tenant";
import { uploadBlob } from "@/lib/integrations/vercel-blob/upload";
import { deleteBlob } from "@/lib/integrations/vercel-blob/delete";

export async function uploadWorkspaceAssetWorkflow(formData: FormData) {
  const file = formData.get("file");
  const domain = formData.get("domain");
  if (domain !== "portal" && domain !== "social")
    throw new Error("Invalid file destination.");
  if (!(file instanceof File) || file.size === 0 || file.size > 750000)
    throw new Error("Choose a non-empty file up to 750 KB.");
  const identity = await requireIdentity();
  const access = await withTenantTransaction(identity, async (_tx, access) => {
    assertPermission(
      access,
      domain === "portal" ? "portal:write" : "social:write",
    );
    return access;
  });
  const filename = file.name.replace(/[\\/\r\n]/g, "_").slice(0, 255) || "file";
  const blob = await uploadBlob(
    `${access.organizationId}/${randomUUID()}`,
    file,
    file.type || "application/octet-stream",
  );
  try {
    return await withTenantTransaction(identity, async (tx, current) => {
      assertPermission(
        current,
        domain === "portal" ? "portal:write" : "social:write",
      );
      if (current.organizationId !== access.organizationId)
        throw new Error("Workspace changed during upload.");
      const asset = await tx.asset.create({
        data: {
          organizationId: current.organizationId,
          createdByMembershipId: current.membershipId,
          storageProvider: "vercel-blob",
          storageKey: blob.pathname,
          filename,
          contentType: file.type || "application/octet-stream",
          byteSize: BigInt(file.size),
        },
        select: { id: true, filename: true },
      });
      return asset;
    });
  } catch (cause) {
    try {
      await deleteBlob(blob.pathname);
    } catch {
      throw new Error(
        "File metadata could not be saved and storage cleanup failed. Contact the workspace administrator.",
      );
    }
    throw cause;
  }
}

export async function downloadWorkspaceFileWorkflow(asset: {
  storageProvider: string;
  storageKey: string;
}) {
  if (asset.storageProvider !== "vercel-blob")
    throw new Error("Unsupported file storage provider.");
  return readPrivateBlob(asset.storageKey);
}
