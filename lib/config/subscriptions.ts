export const SUBSCRIPTION_TIERS = ['starter', 'growth', 'enterprise'] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const SUBSCRIPTION_PLANS = Object.freeze({
  starter: Object.freeze({
    monthlyPriceUsd: 149,
    trucks: 5,
    dispatchers: 2,
    driverAppUsers: 5,
    documentStorageGb: 5,
    complianceLevel: 'basic',
    analyticsLevel: 'basic',
    features: Object.freeze({
      dispatchBoard: true,
      vehicleManagement: true,
      driverManagement: true,
      complianceTracking: true,
      iftaReporting: false,
      customReports: false,
      apiAccess: false,
      sso: false,
      prioritySupport: false,
    }),
  }),
  growth: Object.freeze({
    monthlyPriceUsd: 349,
    trucks: 25,
    dispatchers: null,
    driverAppUsers: 25,
    documentStorageGb: 25,
    complianceLevel: 'advanced',
    analyticsLevel: 'full',
    features: Object.freeze({
      dispatchBoard: true,
      vehicleManagement: true,
      driverManagement: true,
      complianceTracking: true,
      iftaReporting: true,
      customReports: true,
      apiAccess: false,
      sso: false,
      prioritySupport: true,
    }),
  }),
  enterprise: Object.freeze({
    monthlyPriceUsd: null,
    truckPricePerMonthUsd: 15,
    minimumMonthlyPriceUsd: 699,
    trucks: null,
    dispatchers: null,
    driverAppUsers: null,
    documentStorageGb: null,
    complianceLevel: 'advanced-audit',
    analyticsLevel: 'custom',
    features: Object.freeze({
      dispatchBoard: true,
      vehicleManagement: true,
      driverManagement: true,
      complianceTracking: true,
      iftaReporting: true,
      customReports: true,
      apiAccess: true,
      sso: true,
      prioritySupport: true,
    }),
  }),
});

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[SubscriptionTier];

export function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return typeof value === 'string' && SUBSCRIPTION_TIERS.includes(value as SubscriptionTier);
}

export function getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier];
}

export function hasSubscriptionFeature(
  tier: SubscriptionTier,
  feature: keyof SubscriptionPlan['features'],
): boolean {
  return SUBSCRIPTION_PLANS[tier].features[feature];
}
