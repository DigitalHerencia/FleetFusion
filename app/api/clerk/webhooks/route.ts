import type { NextRequest } from "next/server";

import {
  processClerkWebhook,
  verifyClerkWebhook,
  WebhookIdentityConflictError,
} from "@/lib/auth/clerk-webhooks";

export async function POST(request: NextRequest) {
  const payload = await request.clone().text();
  let event: Awaited<ReturnType<typeof verifyClerkWebhook>>;

  try {
    event = await verifyClerkWebhook(request);
  } catch {
    return Response.json(
      { error: "Invalid Clerk webhook signature." },
      { status: 400 },
    );
  }

  const eventId = request.headers.get("svix-id");
  if (!eventId) {
    return Response.json(
      { error: "The svix-id header is required." },
      { status: 400 },
    );
  }

  try {
    const processed = await processClerkWebhook(event, eventId, payload);

    return Response.json({ received: true, duplicate: !processed });
  } catch (error) {
    if (error instanceof WebhookIdentityConflictError) {
      return Response.json(
        { error: "Clerk webhook event identity conflict." },
        { status: 409 },
      );
    }
    // Log only a bounded diagnostic code, never payloads, credentials, or PII.
    const code =
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string" &&
      /^P\d{4}$/.test(error.code)
        ? error.code
        : "processing_failed";
    console.error("Clerk webhook processing failed", { code });
    return Response.json(
      { error: "Clerk webhook processing failed." },
      { status: 500 },
    );
  }
}
