import { notFound } from "next/navigation";
import { getContactById } from "@/lib/fetchers/crmFetchers";
import { CrmLeadDetailTemplate } from "@/components/templates/crmLeadDetailTemplate";
export async function CrmLeadDetailFeature({ leadId }: { leadId: string }) {
  const contact = await getContactById(leadId);
  if (!contact) notFound();
  return <CrmLeadDetailTemplate contact={contact} />;
}
