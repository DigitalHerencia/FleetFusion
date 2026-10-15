import { notFound } from "next/navigation";
import { getContactById } from "@/lib/fetchers/crmFetchers";
import { CrmNewContactForm } from "./crmNewContactForm";
export async function CrmEditLeadForm({ leadId }: { leadId: string }) {
  const contact = await getContactById(leadId);
  if (!contact) notFound();
  return <CrmNewContactForm contact={contact} lead />;
}
