"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceSetup } from "@/components/blocks/onboarding-flow";
import { completeOnboarding } from "@/lib/actions/onboardingActions";

export function OnboardingFeatureClient({
  workspaceName,
  canRename,
}: {
  workspaceName: string;
  canRename: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  return (
    <WorkspaceSetup
      initialName={workspaceName}
      canRename={canRename}
      enableInvites={false}
      title="Your workspace"
      description={
        canRename
          ? "Confirm your workspace name to get started."
          : "Confirm your workspace to get started. Your administrator manages its name."
      }
      submitLabel="Save and continue"
      submitting={submitting}
      error={error}
      onSubmit={async ({ name }) => {
        setError("");
        setSubmitting(true);
        try {
          await completeOnboarding({ name });
          router.replace("/dashboard");
          router.refresh();
        } catch {
          setError("Unable to save workspace setup. Please try again.");
          setSubmitting(false);
        }
      }}
    />
  );
}
