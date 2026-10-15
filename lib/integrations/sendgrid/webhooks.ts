import "server-only";

import { EventWebhook } from "@sendgrid/eventwebhook";
import { sendGridWebhookEventsSchema } from "@/schemas/integrationSchemas";
import {
  withProviderOrganizationTransaction,
  withProviderTransaction,
} from "@/lib/db/provider";
import {
  claimWebhookEventTx,
  completeWebhookEventTx,
  failWebhookEventTx,
} from "@/lib/db/transactions/webhook-event.tx";

export { WebhookIdentityConflictError } from "@/lib/db/transactions/webhook-event.tx";

export function verifySendGridWebhook(
  payload: string,
  signature: string | null,
  timestamp: string | null,
) {
  const verificationKey = process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY?.trim();
  if (!verificationKey)
    throw new Error(
      "SendGrid webhooks are not configured. Add SENDGRID_WEBHOOK_VERIFICATION_KEY to .env.local.",
    );
  if (!signature || !timestamp)
    throw new Error("SendGrid webhook signature headers are required.");
  const verifier = new EventWebhook();
  return verifier.verifySignature(
    verifier.convertPublicKeyToECDSA(verificationKey),
    payload,
    signature,
    timestamp,
  );
}

export function parseSendGridWebhookEvents(
  payload: string,
  signature: string | null,
  timestamp: string | null,
) {
  if (!verifySendGridWebhook(payload, signature, timestamp)) {
    throw new Error("Invalid SendGrid webhook signature.");
  }
  return sendGridWebhookEventsSchema.parse(JSON.parse(payload));
}

export async function processSendGridWebhookEvents(
  events: ReturnType<typeof parseSendGridWebhookEvents>,
) {
  for (const event of events) {
    const webhookEventId = await withProviderTransaction((tx) =>
      claimWebhookEventTx(tx, {
        provider: "sendgrid",
        eventId: event.sg_event_id,
        type: event.event,
        payload: JSON.stringify(event),
        organizationId: event.organizationId,
      }),
    );
    if (!webhookEventId) continue;

    try {
      await withProviderOrganizationTransaction(
        event.organizationId,
        async (tx) => {
          await tx.auditEvent.create({
            data: {
              organizationId: event.organizationId,
              action: `email.${event.event}`,
              resourceType: "email",
              resourceId: event.sg_message_id ?? null,
            },
          });
          await completeWebhookEventTx(tx, webhookEventId);
        },
      );
    } catch (error) {
      try {
        await withProviderTransaction((tx) =>
          failWebhookEventTx(tx, webhookEventId, "processing_failed"),
        );
      } catch (recordingError) {
        throw new AggregateError(
          [error, recordingError],
          "SendGrid webhook processing and failure recording both failed.",
        );
      }
      throw error;
    }
  }
}
