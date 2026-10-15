import type Stripe from "stripe";

function mapStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "trialing":
      return "TRIALING" as const;
    case "active":
      return "ACTIVE" as const;
    case "paused":
      return "PAUSED" as const;
    case "canceled":
    case "incomplete_expired":
      return "CANCELED" as const;
    default:
      return "PAST_DUE" as const;
  }
}

export function toBillingSubscriptionInput(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId)
    throw new Error("Stripe subscription metadata.organizationId is required.");
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const periodEnd = subscription.items.data.reduce(
    (latest, item) => Math.max(latest, item.current_period_end),
    0,
  );
  return {
    organizationId,
    provider: "stripe",
    providerCustomerId: customerId,
    providerSubscriptionId: subscription.id,
    planKey:
      subscription.items.data[0]?.price.lookup_key ??
      subscription.items.data[0]?.price.id ??
      "unmapped",
    status: mapStatus(subscription.status),
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

export function getBillingSubscriptionInputFromEvent(event: Stripe.Event) {
  if (!event.type.startsWith("customer.subscription.")) return null;
  return toBillingSubscriptionInput(event.data.object as Stripe.Subscription);
}
