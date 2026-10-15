"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PortalDocumentsTemplate } from "@/components/templates/portalDocumentsTemplate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createPortalDocument } from "@/lib/actions/portalActions";
import type { PortalDocumentDTO } from "@/types/portalTypes";
export function DocumentsFeatureClient({
  documents,
  canWrite,
}: {
  documents: PortalDocumentDTO[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <PortalDocumentsTemplate
      documents={documents.filter((document) =>
        `${document.title} ${document.latestVersion?.filename ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )}
      toolbar={
        <Input
          aria-label="Search documents"
          placeholder="Search document or filename"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      }
    >
      {canWrite && (
        <details className="surface-inset p-4">
          <summary className="cursor-pointer type-label">
            Create document
          </summary>
          <form
            className="mt-4 space-y-3"
            action={(data) =>
              startTransition(async () => {
                try {
                  const document = await createPortalDocument({
                    title: data.get("title"),
                    description: data.get("description"),
                    clientVisible: false,
                  });
                  router.push(`/portal/documents/${document.id}`);
                  router.refresh();
                } catch {
                  setMessage(
                    "Document could not be created. Check fields and permissions.",
                  );
                }
              })
            }
          >
            <Label htmlFor="document-title">Title</Label>
            <Input id="document-title" name="title" required />
            <Label htmlFor="document-description">Description</Label>
            <textarea
              id="document-description"
              name="description"
              className="control-field w-full"
            />
            <Button type="submit" disabled={pending}>
              Create document
            </Button>
            <p role="status">{message}</p>
          </form>
        </details>
      )}
    </PortalDocumentsTemplate>
  );
}
