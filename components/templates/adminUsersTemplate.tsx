import type { ReactNode } from "react";
import type { AdminMembershipDTO } from "@/types/adminTypes";
import {
  DashboardLayout,
  DashboardTable,
} from "@/components/blocks/dashboard-layout";
export function AdminUsersTemplate({
  memberships,
  toolbar,
}: {
  memberships: AdminMembershipDTO[];
  toolbar: ReactNode;
}) {
  return (
    <DashboardLayout title="Member administration" nav={[]} toolbar={toolbar}>
      <DashboardTable
        columns={[
          { key: "person", label: "Member" },
          { key: "email", label: "Email" },
          { key: "role", label: "Application role" },
          { key: "status", label: "Access status" },
          { key: "joined", label: "Joined" },
        ]}
        rows={memberships.map((membership) => ({
          id: membership.id,
          href: `/admin/users/${membership.user.id}`,
          cells: {
            person:
              membership.user.displayName ??
              membership.user.email ??
              "Unnamed user",
            email: membership.user.email,
            role: membership.role,
            status: membership.status,
            joined: membership.createdAt.slice(0, 10),
          },
        }))}
      />
    </DashboardLayout>
  );
}
