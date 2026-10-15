import Link from "next/link";
import type { PortalDocumentDTO } from "@/types/portalTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function PortalHomeTemplate({
  documents,
}: {
  documents: PortalDocumentDTO[];
}) {
  return (
    <DashboardLayout title="Client workspace" nav={[]}>
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <DashboardPanel title="Recent documents">
          <ul className="space-y-4">
            {documents.slice(0, 8).map((document) => (
              <li
                key={document.id}
                className="flex flex-wrap justify-between gap-3 border-b border-border pb-3"
              >
                <Link
                  className="type-link"
                  href={`/portal/documents/${document.id}`}
                >
                  {document.title}
                </Link>
                <span>
                  Version {document.currentVersionNumber} · {document.status}
                </span>
              </li>
            ))}
          </ul>
          {!documents.length && <p>No documents have been shared with you.</p>}
        </DashboardPanel>
        <DashboardPanel title="Workspace services">
          <nav className="flex flex-col gap-4">
            <Link className="type-link" href="/portal/documents">
              Browse document vault
            </Link>
            <Link className="type-link" href="/portal/billing">
              Billing overview
            </Link>
            <Link className="type-link" href="/support/tickets/new">
              Request support
            </Link>
          </nav>
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
