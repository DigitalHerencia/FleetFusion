# SETTINGS Domain Specification

## 1. Overview

The Settings domain manages organization profiles, member roles, subscription management, and feature flags.

## 2. Directory Structure

This domain is implemented in `src/app/settings/` and contains:

- **Schemas:** `schemas/settings.schema.ts`
- **Actions:** `lib/settingsActions.ts`
- **Fetchers:** `lib/settingsFetchers.ts`
- **Hooks:** `lib/settingsHooks.ts`
- **Components:** `components/*` (OrganizationProfileForm, MembersTable, SubscriptionPanel)
- **Tests:** `tests/*`

## 3. Data Models

- `Organization`
- `OrganizationMembership`
- `Subscription`
- `FeatureFlag`

## 4. Key Features & Implementation

### 4.1 Organization Profile

- **Action:** `updateOrgProfile`
- **Fetcher:** `getOrgProfile`
- **Validation:** `orgProfileSchema`

### 4.2 Member Management

- **Actions:** `updateMemberRole`, `inviteMember`
- **Fetcher:** `getOrgMembers`
- **Component:** `MembersTable`

### 4.3 Subscription & Feature Flags

- **Actions:** `updateSubscription`, `updateFeatureFlags`
- **Fetchers:** `getSubscriptionInfo`, `getFeatureFlags`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/settingsActions.test.ts`
  - `tests/settingsFetchers.test.ts`
  - `tests/settingsPageview.test.ts`
