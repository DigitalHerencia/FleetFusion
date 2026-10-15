import {
  processStripeWebhook,
  verifyStripeWebhook,
  WebhookIdentityConflictError,
} from "@/lib/integrations/stripe/webhooks";

export async function POST(request: Request) {
  const payload = await request.text();
  let event;

  try {
    event = verifyStripeWebhook(
      payload,
      request.headers.get("stripe-signature"),
    );
  } catch {
    return Response.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  try {
    const processed = await processStripeWebhook(event, payload);

    return Response.json({ received: true, duplicate: !processed });
  } catch (error) {
    if (error instanceof WebhookIdentityConflictError) {
      return Response.json(
        { error: "Stripe webhook event identity conflict." },
        { status: 409 },
      );
    }
    return Response.json(
      { error: "Stripe webhook processing failed." },
      { status: 500 },
    );
  }
}
