export type OrganizationSettingsProfile = {
  id: string;
  name: string;
  timezone: string;
  legalName: string;
  dbaName: string;
  dotNumber: string;
  mcNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type SettingsMember = {
  id: string;
  role: string;
  status: string;
  createdAt: Date | string;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    status: string;
  };
};

export type SettingsSubscription = {
  id: string | null;
  tier: string;
  planKey: string;
  status: string;
  renewsAt: Date | string | null;
  canceledAt: Date | string | null;
  features: Record<string, boolean>;
};

export type SettingsFeatureFlags = {
  flags: Record<string, boolean>;
  details: Array<{ key: string; value: boolean; scope: string }>;
  planKey: string;
};
