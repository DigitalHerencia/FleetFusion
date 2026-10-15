import { AdminUserDetailFeature } from "./adminUserDetailFeature";
export function AdminEditUserForm({ userId }: { userId: string }) {
  return <AdminUserDetailFeature userId={userId} />;
}
