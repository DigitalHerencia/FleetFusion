export type NotificationRecord = {
  id: string;
  type: string;
  channel: string;
  status: string;
  title: string;
  body: string;
  readAt?: Date | string | null;
  createdAt: Date | string;
};

export type NotificationPreferences = {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  categories?: unknown;
};
