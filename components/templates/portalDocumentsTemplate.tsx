import Link from "next/link";
import type { ReactNode } from "react";
import type { PortalDocumentDTO } from "@/types/portalTypes";
import { DashboardLayout } from "@/components/blocks/dashboard-layout";
export function PortalDocumentsTemplate({
  documents,
  toolbar,
  children,
}: {
  documents: PortalDocumentDTO[];
  toolbar: ReactNode;
  children?: ReactNode;
}) {
  return (
    <DashboardLayout title="Document vault" nav={[]} toolbar={toolbar}>
      {children}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((document) => (
          <article key={document.id} className="space-y-3 surface-card p-5">
            <p className="type-caption">
              {document.latestVersion?.contentType ?? "Document folder"}
            </p>
            <Link
              className="type-title hover:underline"
              href={`/portal/documents/${document.id}`}
            >
              {document.title}
            </Link>
            <p className="line-clamp-3 text-muted-primary">
              {document.description}
            </p>
            <p>
              Version {document.currentVersionNumber} · {document.status}
            </p>
            <p className="text-sm">
              {document.latestVersion?.filename ?? "No file version yet"}
            </p>
          </article>
        ))}
      </div>
      {!documents.length && <p>No matching documents.</p>}
    </DashboardLayout>
  );
}
