export const FEATURE_FLAG_KEYS = [
  'auth',
  'analytics',
  'realTime',
  'ifta',
  'customReports',
  'apiAccess',
  'sso',
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];
export type FeatureFlags = Readonly<Record<FeatureFlagKey, boolean>>;

function envFlag(value: string | undefined, fallback: boolean): boolean {
  value = value?.trim().toLowerCase();
  if (value === 'true' || value === '1' || value === 'on') return true;
  if (value === 'false' || value === '0' || value === 'off') return false;
  return fallback;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = Object.freeze({
  auth: envFlag(process.env['NEXT_PUBLIC_ENABLE_AUTH'], true),
  analytics: envFlag(process.env['NEXT_PUBLIC_ENABLE_ANALYTICS'], true),
  realTime: envFlag(process.env['NEXT_PUBLIC_ENABLE_REAL_TIME'], false),
  ifta: false,
  customReports: false,
  apiAccess: false,
  sso: false,
});

export function isFeatureEnabled(
  key: FeatureFlagKey,
  overrides: Partial<Record<FeatureFlagKey, boolean>> = {},
): boolean {
  return overrides[key] ?? DEFAULT_FEATURE_FLAGS[key];
}

export function getFeatureFlags(
  overrides: Partial<Record<FeatureFlagKey, boolean>> = {},
): FeatureFlags {
  return Object.freeze({ ...DEFAULT_FEATURE_FLAGS, ...overrides });
}
