import { Suspense } from "react";

import { IntegrationsFeature } from "@/features/settings/integrationsFeature";
import { IntegrationsSkeleton } from "@/features/settings/integrationsSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<IntegrationsSkeleton />}>
      <IntegrationsFeature />
    </Suspense>
  );
}
