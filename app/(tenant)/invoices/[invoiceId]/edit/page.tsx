import { InvoiceEditForm } from "@/features/invoicing/invoiceEditForm";

export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  return <InvoiceEditForm invoiceId={invoiceId} />;
}
