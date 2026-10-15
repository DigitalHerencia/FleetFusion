import type { ReactNode } from "react";
import type { AdminMembershipDTO } from "@/types/adminTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function AdminUserDetailTemplate({
  membership,
  children,
}: {
  membership: AdminMembershipDTO;
  children: ReactNode;
}) {
  return (
    <DashboardLayout
      title={membership.user.displayName ?? membership.user.email ?? "Member"}
      nav={[]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel title="Identity">
          <p>{membership.user.email}</p>
          <p className="mt-4">Joined {membership.createdAt.slice(0, 10)}</p>
          <p>Access: {membership.status}</p>
        </DashboardPanel>
        <DashboardPanel title="Access management">{children}</DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
