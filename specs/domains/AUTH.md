# Domain Spec: Auth

## Scope

Authentication (Clerk), authorization (custom RBAC), user/org membership management, invitations.

## Key Use Cases

- Sign-up, sign-in, MFA (Clerk-managed)
- Session handling and org resolution
- Invite members, accept invitations
- Manage roles and permissions per organization

## Data

- `User` (clerkId, email, name, imageUrl, deletedAt)
- `OrganizationMembership` (userId, organizationId, role)
- `WebhookEvent` (svixId, type, payload)

## Server Actions (examples)

- `send-invite.action.ts`: admin-only; creates invitation record, emails invite.
- `accept-invite.action.ts`: creates membership, links Clerk user.
- `update-role.action.ts`: admin/manager; updates `role` with audit log.

## Fetchers

- `get-current-user.ts`: returns user + memberships.
- `get-org-members.ts`: paginated members with roles.

## Validation (Zod)

- Invitation: email (Clerk-valid), role in enum, expiresAt optional.
- Role update: role enum, target user exists in org.

## Policies

- RBAC enforced on every action; admins manage roles; managers manage most except billing.
- Soft-delete users; keep audit trail.

## UI

- Server-rendered settings pages; client interactivity for role selectors.
- Guarded components that check permissions before rendering actions.
