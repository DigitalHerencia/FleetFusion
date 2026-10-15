"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addPortalDocumentVersion } from "@/lib/actions/portalActions";
import type { PortalDocumentDTO } from "@/types/portalTypes";
export function DocumentFeatureClient({
  document,
  assets,
}: {
  document: PortalDocumentDTO;
  assets: { id: string; filename: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <form
      className="mt-5 space-y-3"
      action={(data) =>
        startTransition(async () => {
          try {
            await addPortalDocumentVersion({
              documentId: document.id,
              expectedVersion: document.version,
              assetId: data.get("assetId"),
              notes: data.get("notes"),
            });
            setMessage("Version added for review.");
            router.refresh();
          } catch {
            setMessage(
              "Version could not be added. Check access and reload the latest document.",
            );
          }
        })
      }
    >
      <Label htmlFor="version-asset">Add a version from workspace files</Label>
      <select
        id="version-asset"
        name="assetId"
        className="control-field w-full"
        required
      >
        <option value="">Select a file</option>
        {assets.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.filename}
          </option>
        ))}
      </select>
      <Label htmlFor="version-notes">Version notes</Label>
      <textarea
        id="version-notes"
        name="notes"
        className="control-field w-full"
      />
      {!assets.length && <p>No workspace files are available.</p>}
      <Button type="submit" disabled={pending || !assets.length}>
        Add version
      </Button>
      <p role="status">{message}</p>
    </form>
  );
}
