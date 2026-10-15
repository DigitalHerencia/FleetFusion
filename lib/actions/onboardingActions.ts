"use server";
import { revalidatePath } from "next/cache";
import { requireIdentity } from "@/lib/auth/auth";
import { withTenantTransaction } from "@/lib/db/tenant";
import { completeOnboardingTx } from "@/lib/db/transactions/onboarding.tx";
import { onboardingSchema } from "@/schemas/commonSchemas";

export async function completeOnboarding(rawInput: unknown) {
  const input = onboardingSchema.parse(rawInput);
  const identity = await requireIdentity();
  await withTenantTransaction(identity, (tx, access) =>
    completeOnboardingTx(tx, access, input.name),
  );
  revalidatePath("/", "layout");
}
