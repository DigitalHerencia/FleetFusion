import { CrmContactsFeatureClient } from "./crmContactsFeature.client";
import { getContacts } from "@/lib/fetchers/crmFetchers";
export async function CrmLeadsFeature() {
  return (
    <CrmContactsFeatureClient
      contacts={await getContacts({ status: "LEAD" })}
      lead
    />
  );
}
