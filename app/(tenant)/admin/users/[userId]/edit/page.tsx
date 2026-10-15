import { AdminEditUserForm } from "@/features/admin/adminEditUserForm";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <AdminEditUserForm userId={userId} />;
}
