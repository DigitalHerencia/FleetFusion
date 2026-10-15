import "server-only";

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { config } from "dotenv";

import type { ClerkUserProjection } from "@/types/integrationTypes";
import { withProviderTransaction } from "@/lib/db/provider";
import {
  anonymizeClerkUserTx,
  syncClerkUserTx,
} from "@/lib/db/transactions/clerk-user.tx";
import {
  claimWebhookEventTx,
  completeWebhookEventTx,
  failWebhookEventTx,
} from "@/lib/db/transactions/webhook-event.tx";

export { WebhookIdentityConflictError } from "@/lib/db/transactions/webhook-event.tx";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export async function verifyClerkWebhook(request: NextRequest) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    throw new Error("CLERK_WEBHOOK_SIGNING_SECRET is required.");
  }
  return verifyWebhook(request, { signingSecret });
}

export function projectClerkUser(user: {
  id: string;
  email_addresses: Array<{ id: string; email_address: string }>;
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  username: string | null;
}): ClerkUserProjection {
  const primaryEmail = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id,
  );
  const displayName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    clerkUserId: user.id,
    email: primaryEmail?.email_address ?? null,
    displayName: displayName || user.username,
    imageUrl: user.image_url || null,
    username: user.username,
  };
}

export async function processClerkWebhook(
  event: Awaited<ReturnType<typeof verifyClerkWebhook>>,
  eventId: string,
  payload: string,
) {
  const webhookEventId = await withProviderTransaction((tx) =>
    claimWebhookEventTx(tx, {
      provider: "clerk",
      eventId,
      type: event.type,
      payload,
    }),
  );
  if (!webhookEventId) return false;

  try {
    await withProviderTransaction(async (tx) => {
      if (event.type === "user.created" || event.type === "user.updated") {
        await syncClerkUserTx(tx, projectClerkUser(event.data));
      } else if (event.type === "user.deleted" && event.data.id) {
        await anonymizeClerkUserTx(tx, event.data.id);
      }

      await completeWebhookEventTx(tx, webhookEventId);
    });
    return true;
  } catch (error) {
    try {
      await withProviderTransaction((tx) =>
        failWebhookEventTx(tx, webhookEventId, "processing_failed"),
      );
    } catch (recordingError) {
      throw new AggregateError(
        [error, recordingError],
        "Clerk webhook processing and failure recording both failed.",
      );
    }
    throw error;
  }
}
