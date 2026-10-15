import { getCrmAccounts } from "@/lib/fetchers/crmFetchers";
import { CrmAccountsFeatureClient } from "./crmAccountsFeature.client";
export async function CrmAccountsFeature() {
  return <CrmAccountsFeatureClient accounts={await getCrmAccounts()} />;
}
