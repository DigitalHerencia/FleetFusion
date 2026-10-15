import { Suspense } from "react";

import { PortalFeature } from "@/features/portal/portalFeature";
import { PortalSkeleton } from "@/features/portal/portalSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <PortalFeature />
    </Suspense>
  );
}
