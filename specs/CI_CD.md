# FleetFusion CI/CD Specification

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft

## Goals

- Reliable, fast pipeline (<10 min for CI happy path).
- Deterministic deployments with preview environments per PR.
- Strict quality gates: lint, type-check, tests (unit/integration/e2e), security checks.

## Pipelines

- **Lint & Type Check (`lint.yml`):** Runs on push/PR. Checks formatting, linting, and types.
- **CI (`ci.yml`):** Runs on push/PR. Builds the project and runs unit tests with a Postgres service.
- **E2E (`e2e.yml`):** Runs on PRs (if source/prisma changes) or manual dispatch. Runs Playwright tests.
- **Release (`release.yml`):** Runs on `v*` tags. Builds and creates a GitHub Release.

## GitHub Actions (reference)

The workflows are defined in `.github/workflows/`:

1.  **`lint.yml`**:
    - `pnpm format:check`
    - `pnpm lint`
    - `pnpm type-check`
2.  **`ci.yml`**:
    - Services: Postgres 15
    - `pnpm prisma:generate`
    - `pnpm build`
    - `pnpm test` (Vitest)
3.  **`e2e.yml`**:
    - Services: Postgres 15
    - `pnpm exec playwright install`
    - `pnpm test:e2e`
    - Uploads Playwright report on failure/always.
4.  **`release.yml`**:
    - Trigger: `v*` tag
    - `pnpm build`
    - Creates GitHub Release with auto-generated notes.

### Workflow Files

- `.github/workflows/lint.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/e2e.yml`
- `.github/workflows/release.yml`

## Environments & Databases

- **Preview (PR):** Vercel preview + Neon branch (per-PR branch if using branching API).
- **Staging:** Vercel production project (staging) + Neon staging branch.
- **Production:** Vercel prod + Neon main.
- Migrations: `prisma migrate deploy` in CI before app start; for production, gate with backup/confirmation.

## Secrets & Config

- Stored in GitHub Actions secrets and Vercel/Neon envs.
- Required: `DATABASE_URL` (Neon pooled), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `SVIX_*` if separate, `SENTRY_DSN`, `UPSTASH_REDIS_REST_URL/TOKEN`, `VERCEL_*`.

## Quality Gates

- ESLint 9: no warnings.
- TypeScript: zero errors.
- Tests: unit/integration/e2e pass; coverage uploaded.
- Optional: Lighthouse CI for marketing pages; axe-core for a11y on key flows.

## Deployment Strategy

- Preview every PR.
- Main auto-deploys to staging after CI.
- Production via release branch + manual approval (recommended) or tag.

## Rollbacks

- Vercel instant rollback to previous deployment.
- Neon point-in-time recovery for DB; keep schema migrations reversible when possible.

## Observability in Pipeline

- Upload Playwright traces on failure.
- Emit test timing metrics; track flake rate.

## Caching

- Enable pnpm cache and Next.js build cache in CI (where supported by Vercel or actions/cache).

## Branch Protections

- Require CI checks: lint, type-check, test, e2e.
- Require at least one review for main.
