import { notFound } from "next/navigation";
import { getContactById } from "@/lib/fetchers/crmFetchers";
import { CrmNewContactForm } from "./crmNewContactForm";
export async function CrmEditContactForm({ contactId }: { contactId: string }) {
  const contact = await getContactById(contactId);
  if (!contact) notFound();
  return <CrmNewContactForm contact={contact} />;
}
