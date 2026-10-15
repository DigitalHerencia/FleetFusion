import { CrmContactsFeatureClient } from "./crmContactsFeature.client";
import { getContacts } from "@/lib/fetchers/crmFetchers";
export async function CrmContactsFeature() {
  return <CrmContactsFeatureClient contacts={await getContacts()} />;
}
