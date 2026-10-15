import "server-only";

import { getStripeClient } from "./client";

export function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
) {
  return getStripeClient().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
