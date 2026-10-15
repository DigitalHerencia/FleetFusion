import "server-only";

import Stripe from "stripe";

let client: Stripe | undefined;

export function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey)
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local.",
    );
  client ??= new Stripe(apiKey);
  return client;
}
