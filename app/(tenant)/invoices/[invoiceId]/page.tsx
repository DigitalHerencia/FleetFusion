import { Suspense } from "react";

import { InvoiceFeature } from "@/features/invoicing/invoiceFeature";
import { InvoiceSkeleton } from "@/features/invoicing/invoiceSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  return (
    <Suspense fallback={<InvoiceSkeleton />}>
      <InvoiceFeature invoiceId={invoiceId} />
    </Suspense>
  );
}
