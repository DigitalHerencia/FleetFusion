# Domain Spec: Settings

## Scope

Org profile, user management, billing/subscription, feature flags.

## Entities

- `Organization` (profile, subscriptionTier/status)
- `OrganizationMembership` (role)
- `FeatureFlag` (future, per-org overrides)

## Server Actions

- `update-organization.action.ts`: update profile fields; validate DOT/MC formats.
- `update-subscription.action.ts`: tier change; enforce feature gates immediately.
- `update-user-role.action.ts`: same as auth but surfaced here.

## Business Rules

- Tier gates: starter/growth/enterprise map to limits (trucks, dispatchers, drivers, storage, features).
- Downgrade locks features but preserves data.

## Fetchers

- `get-organization.ts`: profile + subscription.
- `list-members.ts`: list users/roles.

## UI

- Settings shell with tabs: Profile, Users & Roles, Billing, Feature Flags.
