import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "../generated/prisma/client";
import type { AccessContext } from "../types/access";
import { completeOnboardingTx } from "../lib/db/transactions/onboarding.tx";
import { onboardingSchema } from "../schemas/commonSchemas";

const access: AccessContext = {
  clerkUserId: "clerk-test",
  userId: "user-test",
  membershipId: "member-test",
  organizationId: "org-test",
  role: "MEMBER",
};
function fixture(completed = false) {
  const writes: unknown[] = [];
  const tx = {
    $queryRaw: async () => [],
    auditEvent: {
      findFirst: async ({ where }: { where: Record<string, string> }) => {
        assert.equal(where.organizationId, access.organizationId);
        assert.equal(where.resourceId, access.membershipId);
        assert.equal(where.actorUserId, access.userId);
        return completed ? { id: "event" } : null;
      },
      create: async (args: unknown) => {
        writes.push(args);
      },
    },
    organization: {
      findFirstOrThrow: async () => ({ name: "Existing" }),
      update: async (args: unknown) => {
        writes.push(args);
      },
    },
  } as unknown as Prisma.TransactionClient;
  return { tx, writes };
}
test("members cannot rename an organization during onboarding", async () => {
  const { tx, writes } = fixture();
  await assert.rejects(
    completeOnboardingTx(tx, access, "Unauthorized rename"),
    /organization:write/,
  );
  assert.equal(writes.length, 0);
});
test("members can confirm their existing workspace without elevated rights", async () => {
  const { tx, writes } = fixture();
  await completeOnboardingTx(tx, access, "Existing");
  assert.equal(writes.length, 1);
});
test("owners can rename and record completion", async () => {
  const { tx, writes } = fixture();
  await completeOnboardingTx(tx, { ...access, role: "OWNER" }, "New name");
  assert.equal(writes.length, 2);
});
test("repeated completion does not rename the workspace or duplicate the event", async () => {
  const { tx, writes } = fixture(true);
  await completeOnboardingTx(tx, access, "Different");
  assert.equal(writes.length, 0);
});
test("onboarding rejects empty names and client supplied tenant identifiers", () => {
  assert.equal(onboardingSchema.safeParse({ name: "   " }).success, false);
  assert.equal(
    onboardingSchema.safeParse({ name: "Valid", organizationId: "other" })
      .success,
    false,
  );
  assert.equal(onboardingSchema.parse({ name: "  Valid  " }).name, "Valid");
});
