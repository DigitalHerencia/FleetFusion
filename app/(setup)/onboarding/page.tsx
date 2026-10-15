import { Suspense } from "react";

import { OnboardingFeature } from "@/features/onboarding/onboardingFeature";
import { OnboardingSkeleton } from "@/features/onboarding/onboardingSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingFeature />
    </Suspense>
  );
}
