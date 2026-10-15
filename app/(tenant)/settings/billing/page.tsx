import { Suspense } from "react";

import { BillingFeature } from "@/features/settings/billingFeature";
import { BillingSkeleton } from "@/features/settings/billingSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingFeature />
    </Suspense>
  );
}
