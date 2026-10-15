import { notFound } from "next/navigation";
import { getCrmAccount } from "@/lib/fetchers/crmFetchers";
import { CrmNewAccountForm } from "./crmNewAccountForm";
export async function CrmEditAccountForm({ accountId }: { accountId: string }) {
  const account = await getCrmAccount(accountId);
  if (!account) notFound();
  return <CrmNewAccountForm account={account} />;
}
