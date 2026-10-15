import { Suspense } from "react";

import { CrmContactsFeature } from "@/features/crm/crmContactsFeature";
import { CrmContactsSkeleton } from "@/features/crm/crmContactsSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<CrmContactsSkeleton />}>
      <CrmContactsFeature />
    </Suspense>
  );
}
