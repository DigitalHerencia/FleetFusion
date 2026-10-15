import Link from "next/link";
import type { OrganizationDTO } from "@/types/commonTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function SharedDashboardTemplate({
  organization,
}: {
  organization: OrganizationDTO;
}) {
  return (
    <DashboardLayout title={organization.name} nav={[]}>
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <DashboardPanel title="Workspaces">
          <nav className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Customer relationships",
                href: "/crm/pipeline",
                description: "Qualify opportunities and manage accounts.",
              },
              {
                title: "Project delivery",
                href: "/projects",
                description: "Plan work, assign tasks and follow deadlines.",
              },
              {
                title: "Support queue",
                href: "/support/inbox",
                description: "Triage requests and continue conversations.",
              },
              {
                title: "Campaign planning",
                href: "/marketing/campaigns",
                description: "Define audiences and plan campaigns.",
              },
              {
                title: "Invoicing",
                href: "/invoices",
                description:
                  "Prepare itemized invoices and review receivables.",
              },
              {
                title: "Publishing",
                href: "/social/calendar",
                description: "Compose, approve and schedule social posts.",
              },
              {
                title: "AI playground",
                href: "/ai/playground",
                description:
                  "Generate responses using the configured provider.",
              },
              {
                title: "Client documents",
                href: "/portal/documents",
                description: "Manage shared document versions.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="space-y-2 surface-inset p-4 hover:bg-primary/10"
              >
                <h2 className="type-label">{item.title}</h2>
                <p className="text-sm text-muted-primary">{item.description}</p>
              </Link>
            ))}
          </nav>
        </DashboardPanel>
        <DashboardPanel title="Your workspace">
          <p>{organization.memberCount} members</p>
          <p className="mt-3">Time zone: {organization.timezone}</p>
          <nav className="mt-6 flex flex-col gap-4">
            <Link className="type-link" href="/my-tasks">
              My tasks
            </Link>
            <Link className="type-link" href="/settings/profile">
              Workspace preferences
            </Link>
            <Link className="type-link" href="/settings/integrations">
              Integration configuration
            </Link>
          </nav>
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
