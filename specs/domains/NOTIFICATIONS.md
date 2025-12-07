# NOTIFICATIONS Domain Specification

## 1. Overview

The Notifications domain handles alert delivery, user preference management, and notification routing across channels (in-app, email, SMS).

## 2. Directory Structure

This domain is implemented in `src/app/notifications/` and contains:

- **Schemas:** `schemas/notifications.schema.ts`
- **Actions:** `lib/notificationActions.ts`
- **Fetchers:** `lib/notificationFetchers.ts`
- **Engine:** `lib/notificationsEngine.ts`
- **Components:** `components/*` (NotificationList, NotificationCard, NotificationPreferencesForm)
- **Tests:** `tests/*`

## 3. Data Models

- `Notification`
- `NotificationPreference`

## 4. Key Features & Implementation

### 4.1 Notification Management

- **Actions:** `markNotificationRead`, `markAllRead`, `sendSystemNotification`
- **Fetcher:** `getUserNotifications`, `getUnreadCount`, `getNotificationById`

### 4.2 Preferences

- **Action:** `updateNotificationPreferences`
- **Fetcher:** `getNotificationPreferences`
- **Component:** `NotificationPreferencesForm`

### 4.3 Routing Engine

- **Engine Functions:** `classifyNotificationType`, `computeRoutingTargets`, `buildDigestPayload`, `queueNotificationDelivery`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/notificationRouting.test.ts`
  - `tests/notificationPreferences.test.ts`
  - `tests/notificationsPageview.test.ts`
