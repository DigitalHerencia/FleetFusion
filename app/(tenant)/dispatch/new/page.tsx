import { DispatchLoadForm } from "@/features/dispatch/dispatchLoadForm";
import { getCrmAccounts } from "@/lib/fetchers/crmFetchers";

export default async function Page() {
  const customers = await getCrmAccounts();
  return (
    <main className="container py-8">
      <DispatchLoadForm customers={customers.map(({ id, name }) => ({ id, name }))} />
    </main>
  );
}
