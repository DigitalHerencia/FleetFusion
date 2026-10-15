import {
  DashboardLayout,
  DashboardTable,
} from "@/components/blocks/dashboard-layout";
export function SharedMembersTemplate({
  members,
}: {
  members: { id: string; name: string; role: string; status: string }[];
}) {
  return (
    <DashboardLayout title="Workspace directory" nav={[]}>
      <DashboardTable
        columns={[
          { key: "name", label: "Member" },
          { key: "role", label: "Role" },
          { key: "status", label: "Access" },
        ]}
        rows={members.map((member) => ({
          id: member.id,
          cells: {
            name: member.name,
            role: member.role,
            status: member.status,
          },
        }))}
      />
    </DashboardLayout>
  );
}
