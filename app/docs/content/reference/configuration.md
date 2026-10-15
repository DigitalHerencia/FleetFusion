# Configuration reference

This page describes the configuration boundaries used by FleetFusion. It is intended as an operational overview, not a deployment recipe. Production values are managed through the approved hosting and secret-management environment.

## Application settings

The repository uses Next.js App Router, TypeScript, Tailwind CSS, Prisma, Clerk, and PostgreSQL/Neon. Runtime configuration should be supplied by the deployment environment; do not commit credentials or copy production secrets into local development.

| Configuration area | Purpose                                           | Handling                                                                           |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Identity provider  | Authenticates users and supplies identity context | Configure provider keys and webhook secrets through the deployment secret store    |
| Database           | Stores organization-scoped operational records    | Use environment-specific connection settings; avoid production data in development |
| File storage       | Stores uploaded documents                         | Use validated uploads and signed access paths where configured                     |
| Observability      | Captures logs, traces, and error reports          | Configure endpoints and credentials outside source control                         |

## Environments

Keep development, test, and production configuration separate. Use the least privilege required for each environment, rotate credentials when exposure is suspected, and verify database migration state before application changes are released.

## Safe configuration practices

- Keep secrets in environment-managed secret stores, not code, markdown, logs, or browser bundles.
- Avoid recording credentials, tokens, or unnecessary personal information in application logs.
- Validate configuration changes in a non-production environment before rollout.
- Treat configuration that affects authentication, tenancy, or billing as a security-sensitive change.

See [Security and access model](/docs/reference/security) and [Observability](/docs/reference/observability) for related operational guidance. Consult the repository deployment specifications for implementation-specific settings.
