import { Suspense } from "react";

import { ProfileFeature } from "@/features/settings/profileFeature";
import { ProfileSkeleton } from "@/features/settings/profileSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileFeature />
    </Suspense>
  );
}
