import Link from "next/link";
import type { ReactNode } from "react";
import type { PortalDocumentDTO } from "@/types/portalTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function PortalDocumentDetailTemplate({
  document,
  children,
}: {
  document: PortalDocumentDTO;
  children: ReactNode;
}) {
  return (
    <DashboardLayout title={document.title} nav={[]}>
      <Link className="type-link" href="/portal/documents">
        Document vault
      </Link>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <DashboardPanel title="Document">
          <p className="whitespace-pre-wrap">
            {document.description ?? "No description."}
          </p>
          {document.latestVersion ? (
            <dl className="mt-6 space-y-2">
              <dt>Current file</dt>
              <dd>{document.latestVersion.filename}</dd>
              <dt>Format</dt>
              <dd>{document.latestVersion.contentType}</dd>
              <dt>Size</dt>
              <dd>{document.latestVersion.byteSize} bytes</dd>
              <dt>Added</dt>
              <dd>{document.latestVersion.createdAt.slice(0, 10)}</dd>
            </dl>
          ) : (
            <p className="mt-5">
              This document does not have a file version yet.
            </p>
          )}
        </DashboardPanel>
        <DashboardPanel title="Version and review">
          <p>Version {document.currentVersionNumber}</p>
          <p>Status: {document.status}</p>
          <p>Client visible: {document.clientVisible ? "Yes" : "No"}</p>
          {children}
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
