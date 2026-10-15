# Users and roles

User membership and role assignment determine which organization workflows a person can use. FleetFusion enforces authorization on the server; hiding an action in the interface is not the security boundary.

## Invite a teammate

1. Confirm the person needs access to this organization and use their own work email.
2. Send an organization invitation through the member-management workflow.
3. Select the least-privilege role that covers the person’s responsibilities.
4. Ask the recipient to accept their own invitation and confirm they can access the expected workspace.

If an invitation is sent to the wrong address or is no longer valid, review it and issue a replacement. Do not forward an invitation intended for another person.

## Choose a role

FleetFusion’s documented role set includes `admin`, `manager`, `dispatcher`, `driver`, `compliance`, `accountant`, and `viewer`. Access is organized around capabilities such as dispatch, vehicles, drivers, compliance, IFTA, analytics, settings, and billing. The exact permissions are defined by the organization’s configured role policy.

| Work responsibility      | Example areas to consider                                   |
| ------------------------ | ----------------------------------------------------------- |
| Dispatch coordination    | Loads, assignments, and status                              |
| Compliance work          | Driver and vehicle documents and expiration follow-up       |
| Accounting               | Fuel, mileage, IFTA summaries, and relevant reports         |
| Read-only review         | View access needed for oversight without routine edits      |
| Workspace administration | Membership, organization profile, and subscription settings |

Use the role names and permissions available in your workspace rather than assuming a role grants a specific capability.

## Review access over time

When responsibilities change, update the membership role promptly. Periodically confirm that active users still need access and that privileged roles are limited to appropriate administrators.

## Troubleshooting

If a user cannot access an expected feature, confirm the correct organization, active membership, role, and subscription capability. Organization admins can manage members; platform-wide system administration is reserved for super-admin users.

Related: [Organization settings](/docs/admin-guides/org-settings), [security reference](/docs/reference/security).
