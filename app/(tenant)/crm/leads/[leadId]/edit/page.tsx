import { CrmEditLeadForm } from "@/features/crm/crmEditLeadForm";

export default async function Page({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return <CrmEditLeadForm leadId={leadId} />;
}
