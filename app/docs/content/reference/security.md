# Security and access model

FleetFusion is a multi-tenant application. Each organization’s operational data must remain scoped to that organization, and users should receive only the access needed for their work.

## Authentication and authorization

Clerk provides user authentication. Organization membership and role-based permissions govern access to operational capabilities. The documented roles include `admin`, `manager`, `dispatcher`, `driver`, `compliance`, `accountant`, and `viewer`.

Authorization is enforced by server-side checks for actions and data access. Interface visibility improves usability but is not a security control. If a feature is unavailable, request access through an organization administrator; never use another user’s credentials.

## Tenant isolation and data handling

- Database reads and writes for tenant data must be scoped to the organization.
- Organization context must be included in relevant background and cached operations.
- Validate untrusted input on the server before processing it.
- Use approved upload workflows for documents and avoid sending sensitive files through unapproved channels.
- Do not place secrets in source control, logs, or client-visible configuration.

## Administrative and audit controls

Sensitive changes—such as access changes, billing operations, and deletes—should be limited to authorized roles and recorded for audit where supported. Organization administrators manage their workspace; platform-level system administration is reserved for super-admin users.

## Report a concern

For account or access problems, contact your organization administrator. For a security vulnerability, follow the repository’s official security reporting policy rather than posting details publicly.

More information: [Users and roles](/docs/admin-guides/users-and-roles), [Organization settings](/docs/admin-guides/org-settings), and [Configuration reference](/docs/reference/configuration).
