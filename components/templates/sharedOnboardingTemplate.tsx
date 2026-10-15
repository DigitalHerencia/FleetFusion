import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/blocks/dashboard-layout";
import { OnboardingFlow } from "@/components/blocks/onboarding-flow";

const nav = [
  { label: "Workspace", active: true },
  { label: "Goals" },
  { label: "Complete" },
] as const;

export function SharedOnboardingTemplate({
  clientIsland,
}: {
  clientIsland?: ReactNode;
}) {
  return (
    <DashboardLayout nav={nav} title="Onboarding">
      {clientIsland ?? <OnboardingFlow.WorkspaceSetup />}
    </DashboardLayout>
  );
}
