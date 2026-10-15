import { Suspense } from "react";

import { BillingFeature } from "@/features/portal/billingFeature";
import { BillingSkeleton } from "@/features/portal/billingSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingFeature />
    </Suspense>
  );
}
