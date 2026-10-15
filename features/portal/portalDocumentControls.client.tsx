"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  downloadPortalDocument,
  sharePortalDocument,
} from "@/lib/actions/portalActions";
import { Button } from "@/components/ui/button";
import type { PortalDocumentDTO } from "@/types/portalTypes";
export function PortalDocumentControls({
  document,
  canWrite,
}: {
  document: PortalDocumentDTO;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <div className="my-4 space-y-3">
      {document.latestVersion && (
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                const file = await downloadPortalDocument({
                  documentId: document.id,
                });
                const bytes = Uint8Array.from(atob(file.base64), (character) =>
                  character.charCodeAt(0),
                );
                const url = URL.createObjectURL(
                  new Blob([bytes], { type: "application/octet-stream" }),
                );
                const link = documentElement(file.filename, url);
                link.click();
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              } catch {
                setMessage(
                  "Download failed. Check file availability, storage configuration, and permissions. Downloads are limited to 10 MB.",
                );
              }
            })
          }
        >
          Download current file
        </Button>
      )}
      {canWrite &&
        document.latestVersion &&
        (!document.clientVisible || document.status !== "PUBLISHED") && (
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await sharePortalDocument({
                    documentId: document.id,
                    expectedVersion: document.version,
                  });
                  setMessage("Document shared with workspace clients.");
                  router.refresh();
                } catch {
                  setMessage(
                    "Document could not be shared. Check access or reload the latest version.",
                  );
                }
              })
            }
          >
            Share with clients
          </Button>
        )}
      <p role="status">{message}</p>
    </div>
  );
}
function documentElement(filename: string, url: string) {
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  window.document.body.append(link);
  return link;
}
