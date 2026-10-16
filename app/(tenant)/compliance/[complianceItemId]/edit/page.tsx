import { notFound } from "next/navigation";
import { ComplianceForm } from "@/features/compliance/complianceForm";
import {
  getComplianceFormOptions,
  getComplianceItem,
} from "@/lib/fetchers/complianceFetchers";

export default async function Page({
  params,
}: {
  params: Promise<{ complianceItemId: string }>;
}) {
  const { complianceItemId } = await params;
  const [item, options] = await Promise.all([
    getComplianceItem(complianceItemId),
    getComplianceFormOptions(),
  ]);
  if (!item) notFound();
  return (
    <main className="container space-y-6 py-8">
      <ComplianceForm options={options} item={item} />
    </main>
  );
}
