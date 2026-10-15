import { notFound } from "next/navigation";
import { getContactById } from "@/lib/fetchers/crmFetchers";
import { CrmContactDetailTemplate } from "@/components/templates/crmContactDetailTemplate";
export async function CrmContactDetailFeature({
  contactId,
}: {
  contactId: string;
}) {
  const contact = await getContactById(contactId);
  if (!contact) notFound();
  return <CrmContactDetailTemplate contact={contact} />;
}
