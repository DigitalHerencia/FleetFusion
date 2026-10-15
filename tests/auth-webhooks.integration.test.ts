import assert from "node:assert/strict";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { config } from "dotenv";
import { PrismaClient } from "../generated/prisma/client";
import {
  syncClerkUserTx,
  anonymizeClerkUserTx,
} from "../lib/db/transactions/clerk-user.tx";
import {
  claimWebhookEventTx,
  completeWebhookEventTx,
  WebhookIdentityConflictError,
} from "../lib/db/transactions/webhook-event.tx";

config({ path: ".env.local", quiet: true });

test("Clerk verifies signed payloads and rejects tampered deliveries", async () => {
  const secret = randomBytes(32);
  const signingSecret = `whsec_${secret.toString("base64")}`;
  const eventId = `msg_${randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify({
    type: "user.deleted",
    data: { id: "user_signature_fixture", deleted: true },
  });
  const signature = createHmac("sha256", secret)
    .update(`${eventId}.${timestamp}.${body}`)
    .digest("base64");
  const request = (payload: string) =>
    new NextRequest("https://example.test/api/clerk/webhooks", {
      method: "POST",
      body: payload,
      headers: {
        "svix-id": eventId,
        "svix-timestamp": timestamp,
        "svix-signature": `v1,${signature}`,
      },
    });
  assert.equal(
    (await verifyWebhook(request(body), { signingSecret })).type,
    "user.deleted",
  );
  await assert.rejects(
    verifyWebhook(request(body.replace("user.deleted", "user.created")), {
      signingSecret,
    }),
  );
});

test(
  "Neon user synchronization and webhook deduplication are transactional",
  { skip: process.env.AUTH_WEBHOOK_DB_TEST !== "1" },
  async () => {
    assert.ok(
      process.env.DATABASE_URL,
      "DATABASE_URL is required for the opt-in database test",
    );
    const prisma = new PrismaClient({
      adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
    });
    const rollback = new Error("intentional test rollback");
    try {
      await assert.rejects(
        prisma.$transaction(
          async (tx) => {
            const clerkUserId = `user_auth_test_${randomUUID()}`;
            const event = {
              provider: "clerk",
              eventId: `msg_${randomUUID()}`,
              type: "user.created",
              payload: clerkUserId,
            };
            const claimed = await claimWebhookEventTx(tx, event);
            assert.ok(claimed);
            const projection = {
              clerkUserId,
              username: "auth-test",
              email: null,
              displayName: "Auth test",
              imageUrl: null,
            };
            await syncClerkUserTx(tx, projection);
            await syncClerkUserTx(tx, projection);
            const user = await tx.user.findUniqueOrThrow({
              where: { clerkUserId },
              select: { id: true },
            });
            assert.equal(
              await tx.membership.count({ where: { userId: user.id } }),
              1,
            );
            await completeWebhookEventTx(tx, claimed);
            assert.equal(await claimWebhookEventTx(tx, event), null);
            await assert.rejects(
              claimWebhookEventTx(tx, { ...event, payload: "tampered" }),
              WebhookIdentityConflictError,
            );
            await anonymizeClerkUserTx(tx, clerkUserId);
            await anonymizeClerkUserTx(tx, clerkUserId);
            const deleted = await tx.user.findUniqueOrThrow({
              where: { clerkUserId },
            });
            assert.equal(deleted.displayName, "Deleted user");
            assert.equal(deleted.email, null);
            throw rollback;
          },
          { timeout: 30000 },
        ),
        (error) => error === rollback,
      );
    } finally {
      await prisma.$disconnect();
    }
  },
);
