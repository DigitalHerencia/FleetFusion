import { CrmEditAccountForm } from "@/features/crm/crmEditAccountForm";

export default async function Page({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return <CrmEditAccountForm accountId={accountId} />;
}
