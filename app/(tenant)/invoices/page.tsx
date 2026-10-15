import { Suspense } from "react";

import { InvoicesFeature } from "@/features/invoicing/invoicesFeature";
import { InvoicesSkeleton } from "@/features/invoicing/invoicesSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<InvoicesSkeleton />}>
      <InvoicesFeature />
    </Suspense>
  );
}
