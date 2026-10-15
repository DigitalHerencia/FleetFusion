import { createHash } from "node:crypto";

import type { Prisma } from "../../../generated/prisma/client";

export class WebhookIdentityConflictError extends Error {
  constructor() {
    super("Webhook event identity does not match its original payload.");
    this.name = "WebhookIdentityConflictError";
  }
}

export function hashWebhookPayload(payload: string) {
  return createHash("sha256").update(payload).digest("hex");
}

export async function claimWebhookEventTx(
  tx: Prisma.TransactionClient,
  input: {
    provider: string;
    eventId: string;
    type: string;
    payload: string;
    organizationId?: string | null;
  },
) {
  const payloadHash = hashWebhookPayload(input.payload);
  const inserted = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "WebhookEvent" ("id", "organizationId", "provider", "eventId", "type", "status", "payloadHash", "receivedAt")
    VALUES (gen_random_uuid(), ${input.organizationId ?? null}::uuid, ${input.provider}, ${input.eventId}, ${input.type}, 'PROCESSING', ${payloadHash}, now())
    ON CONFLICT ("provider", "eventId") DO UPDATE
    SET
      "organizationId" = EXCLUDED."organizationId",
      "status" = 'PROCESSING',
      "receivedAt" = now(),
      "processedAt" = NULL,
      "errorCode" = NULL
    WHERE "WebhookEvent"."payloadHash" = EXCLUDED."payloadHash"
      AND "WebhookEvent"."type" = EXCLUDED."type"
      AND (
        "WebhookEvent"."status" = 'FAILED'
        OR (
          "WebhookEvent"."status" = 'PROCESSING'
          AND "WebhookEvent"."receivedAt" < now() - interval '5 minutes'
        )
      )
    RETURNING "id"
  `;

  if (inserted[0]?.id) return inserted[0].id;

  const existing = await tx.webhookEvent.findUnique({
    where: {
      provider_eventId: { provider: input.provider, eventId: input.eventId },
    },
    select: { payloadHash: true, type: true },
  });
  if (
    existing &&
    (existing.payloadHash !== payloadHash || existing.type !== input.type)
  ) {
    throw new WebhookIdentityConflictError();
  }

  return null;
}

export function completeWebhookEventTx(
  tx: Prisma.TransactionClient,
  webhookEventId: string,
) {
  return tx.webhookEvent.update({
    where: { id: webhookEventId },
    data: { status: "PROCESSED", processedAt: new Date(), errorCode: null },
  });
}

export function failWebhookEventTx(
  tx: Prisma.TransactionClient,
  webhookEventId: string,
  errorCode: string,
) {
  return tx.webhookEvent.update({
    where: { id: webhookEventId },
    data: { status: "FAILED", processedAt: new Date(), errorCode },
  });
}
