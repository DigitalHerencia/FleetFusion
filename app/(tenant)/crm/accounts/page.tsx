import { Suspense } from "react";

import { CrmAccountsFeature } from "@/features/crm/crmAccountsFeature";
import { CrmAccountsSkeleton } from "@/features/crm/crmAccountsSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<CrmAccountsSkeleton />}>
      <CrmAccountsFeature />
    </Suspense>
  );
}
