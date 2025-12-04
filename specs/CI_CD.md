# FleetFusion CI/CD Specification

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft

## Goals
- Reliable, fast pipeline (<10 min for CI happy path).
- Deterministic deployments with preview environments per PR.
- Strict quality gates: lint, type-check, tests (unit/integration/e2e), security checks.

## Pipelines
- **CI (per PR, main):** lint → type-check → unit/integration → e2e → artifact upload → preview deploy.
- **CD (main → staging → production):** after CI pass, auto-deploy to staging; production via protected release branch or manual approval.

## GitHub Actions (reference)
- **Triggers:** `push` to `main`, `pull_request` to `main`, `release/*` for production.
- **Jobs:**
  1) `lint`: pnpm install, `pnpm lint`, `pnpm type-check`.
  2) `test`: needs lint; start Postgres service; `pnpm prisma migrate deploy`; `pnpm test:coverage`; upload coverage (Codecov).
  3) `e2e`: needs test; install Playwright deps; `pnpm test:e2e`; upload Playwright report on failure.
  4) `deploy-preview`: needs e2e; Vercel preview deploy with env vars from secrets.
  5) `deploy-staging`/`deploy-production`: gated; uses Vercel production deployment and Neon branch/main db.

### Sample Workflow Sketch (`.github/workflows/ci.yml`)
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma migrate deploy
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-preview:
    runs-on: ubuntu-latest
    needs: e2e
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          scope: ${{ secrets.VERCEL_TEAM_ID }}
      - name: Comment preview URL
        run: echo "Preview deployed" # replace with actual URL output

  deploy-staging:
    runs-on: ubuntu-latest
    needs: e2e
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          scope: ${{ secrets.VERCEL_TEAM_ID }}
          prod: true

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: startsWith(github.ref, 'refs/heads/release/')
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          scope: ${{ secrets.VERCEL_TEAM_ID }}
          prod: true
```

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
