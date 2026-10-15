import { CrmEditContactForm } from "@/features/crm/crmEditContactForm";

export default async function Page({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  return <CrmEditContactForm contactId={contactId} />;
}
