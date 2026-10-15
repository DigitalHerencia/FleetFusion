import type { ReactNode } from "react";
import type { OrganizationDTO } from "@/types/commonTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function SharedProfileSettingsTemplate({
  organization,
  children,
}: {
  organization: OrganizationDTO;
  children: ReactNode;
}) {
  return (
    <DashboardLayout title="Workspace settings" nav={[]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <DashboardPanel title="Workspace">
          <h2 className="type-title">{organization.name}</h2>
          <p className="mt-3">{organization.slug}</p>
          <p>{organization.memberCount} members</p>
        </DashboardPanel>
        <DashboardPanel title="Regional preferences">{children}</DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
