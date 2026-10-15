import { redirect } from "next/navigation";
import { OnboardingFeatureClient } from "@/features/onboarding/onboardingFeature.client";
import { getOnboardingState } from "@/lib/fetchers/onboardingFetchers";

export async function OnboardingFeature() {
  const state = await getOnboardingState();
  if (state.completed) redirect("/dashboard");
  return (
    <OnboardingFeatureClient
      workspaceName={state.workspaceName}
      canRename={state.canRename}
    />
  );
}
