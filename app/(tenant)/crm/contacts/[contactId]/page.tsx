import { Suspense } from "react";

import { CrmContactDetailFeature } from "@/features/crm/crmContactDetailFeature";
import { CrmContactDetailSkeleton } from "@/features/crm/crmContactDetailSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  return (
    <Suspense fallback={<CrmContactDetailSkeleton />}>
      <CrmContactDetailFeature contactId={contactId} />
    </Suspense>
  );
}
