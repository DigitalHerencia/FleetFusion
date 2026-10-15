import { notFound } from "next/navigation";
import { getAdminMemberships } from "@/lib/fetchers/adminFetchers";
import { AdminUserDetailTemplate } from "@/components/templates/adminUserDetailTemplate";
import { AdminUserDetailFeatureClient } from "./adminUserDetailFeature.client";
export async function AdminUserDetailFeature({ userId }: { userId: string }) {
  const membership = (await getAdminMemberships()).find(
    (member) => member.user.id === userId,
  );
  if (!membership) notFound();
  return (
    <AdminUserDetailTemplate membership={membership}>
      <AdminUserDetailFeatureClient
        key={`${membership.role}-${membership.status}`}
        membership={membership}
      />
    </AdminUserDetailTemplate>
  );
}
