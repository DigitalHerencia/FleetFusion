import "server-only";

import { randomBytes } from "node:crypto";

import { getStripeClient } from "./client";

function integrationIdentifier(): string {
  const suffix = Array.from(randomBytes(8), (value) =>
    String.fromCharCode(97 + (value % 26)),
  ).join("");
  return `maximal-template-${suffix}`;
}

export function createCheckoutSession(input: {
  organizationId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
}) {
  return getStripeClient().checkout.sessions.create({
    mode: "subscription",
    ...(input.customerId === undefined ? {} : { customer: input.customerId }),
    integration_identifier: integrationIdentifier(),
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.organizationId,
    metadata: { organizationId: input.organizationId },
    subscription_data: { metadata: { organizationId: input.organizationId } },
  });
}
