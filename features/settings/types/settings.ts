export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  address: string;
  contactEmail: string;
}

export interface OrganizationSettings {
  id: string;
  name: string;
  timezone: string;
  businessRules?: Record<string, unknown>;
  logoUrl?: string;
  address?: string;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark';
  language: string;
  dashboardLayout?: string;
}

export interface NotificationSettings {
  userId: string;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  schedules?: { quietHoursStart: string; quietHoursEnd: string };
}

export interface IntegrationSettings {
  orgId: string;
  services: Record<string, { enabled: boolean; apiKey?: string; webhookUrl?: string }>;
}

export interface BillingSettings {
  orgId: string;
  paymentMethod: string;
  subscriptionPlan: string;
  billingEmail: string;
}

export interface SystemSettings {
  featureFlags: Record<string, boolean>;
  limits: Record<string, number>;
  permissions: Record<string, string[]>;
}

export interface SettingsAuditLog {
  id: string;
  orgId: string;
  userId: string;
  action: string;
  timestamp: Date;
  details: string;
}
