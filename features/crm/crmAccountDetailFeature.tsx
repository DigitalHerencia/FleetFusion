import { notFound } from "next/navigation";
import { getCrmAccount } from "@/lib/fetchers/crmFetchers";
import { CrmAccountDetailTemplate } from "@/components/templates/crmAccountDetailTemplate";
export async function CrmAccountDetailFeature({
  accountId,
}: {
  accountId: string;
}) {
  const account = await getCrmAccount(accountId);
  if (!account) notFound();
  return <CrmAccountDetailTemplate account={account} />;
}
