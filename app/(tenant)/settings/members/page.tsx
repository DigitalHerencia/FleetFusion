import { Suspense } from "react";

import { MembersFeature } from "@/features/settings/membersFeature";
import { MembersSkeleton } from "@/features/settings/membersSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<MembersSkeleton />}>
      <MembersFeature />
    </Suspense>
  );
}
