import "server-only";

import type Stripe from "stripe";

import {
  withProviderOrganizationTransaction,
  withProviderTransaction,
} from "@/lib/db/provider";
import {
  claimWebhookEventTx,
  completeWebhookEventTx,
  failWebhookEventTx,
} from "@/lib/db/transactions/webhook-event.tx";
import { getStripeClient } from "./client";
import { getBillingSubscriptionInputFromEvent } from "./subscriptions";

export { WebhookIdentityConflictError } from "@/lib/db/transactions/webhook-event.tx";

export function verifyStripeWebhook(payload: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret)
    throw new Error(
      "Stripe webhooks are not configured. Add STRIPE_WEBHOOK_SECRET to .env.local.",
    );
  if (!signature) throw new Error("The Stripe-Signature header is required.");
  return getStripeClient().webhooks.constructEvent(payload, signature, secret);
}

export async function processStripeWebhook(
  event: Stripe.Event,
  payload: string,
) {
  const input = getBillingSubscriptionInputFromEvent(event);
  const organizationId = input?.organizationId ?? null;

  const webhookEventId = await withProviderTransaction((tx) =>
    claimWebhookEventTx(tx, {
      provider: "stripe",
      eventId: event.id,
      type: event.type,
      payload,
      organizationId,
    }),
  );
  if (!webhookEventId) return false;

  try {
    if (input) {
      await withProviderOrganizationTransaction(
        input.organizationId,
        async (tx) => {
          await tx.billingSubscription.upsert({
            where: { organizationId: input.organizationId },
            create: input,
            update: input,
          });
          await completeWebhookEventTx(tx, webhookEventId);
        },
      );
    } else {
      await withProviderTransaction((tx) =>
        completeWebhookEventTx(tx, webhookEventId),
      );
    }
    return true;
  } catch (error) {
    try {
      await withProviderTransaction((tx) =>
        failWebhookEventTx(tx, webhookEventId, "processing_failed"),
      );
    } catch (recordingError) {
      throw new AggregateError(
        [error, recordingError],
        "Stripe webhook processing and failure recording both failed.",
      );
    }
    throw error;
  }
}
