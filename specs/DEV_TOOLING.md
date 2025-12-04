# FleetFusion Developer Tooling Specification

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft

## Goals
- Fast feedback (lint/type/test under 10s locally on typical feature scope).
- Consistent formatting and linting across stack (Next.js 16, React 19, TS 5, ESLint 9, Prettier 3).
- Deterministic installs and scripts (pnpm preferred).

## Package Management
- **Manager:** pnpm (frozen lockfile in CI).
- **Node:** 20.x LTS.
- **Scripts (examples):**
  - `pnpm lint` → ESLint 9 flat config
  - `pnpm type-check` → `tsc --noEmit`
  - `pnpm test` → Vitest unit/integration
  - `pnpm test:coverage` → Vitest coverage
  - `pnpm test:e2e` → Playwright
  - `pnpm format` → Prettier write
  - `pnpm format:check` → Prettier check
  - `pnpm prisma:generate` → Prisma client
  - `pnpm prisma:migrate` → Prisma migrate dev/deploy

## Linting (ESLint 9 Flat)
- Base: `@eslint/js` recommended + `typescript-eslint` strict type-checked.
- Next.js plugin, React, React Hooks.
- Rules: no `any`, explicit return types, exhaust deps, no console (warn/error allowed).
- Path aliases validated via TypeScript parser options.

## Formatting (Prettier 3)
- Plugin: `prettier-plugin-tailwindcss` for class sorting.
- Enforced in CI and pre-commit.

## Type Checking
- `tsc --noEmit`, strict mode, bundler module resolution.
- Path aliases `@/*`, `@/domains/*`, `@/shared/*`.

## Git Hooks
- **Husky** + **lint-staged**:
  - `pre-commit`: `lint-staged` → run `eslint --max-warnings=0` and `prettier --check` on staged files; optionally `vitest related --runInBand` for touched files.
  - `pre-push`: optional `pnpm test:ci-lite` (unit only) for contributors.

## Testing Local Workflow
- **Unit/Integration (Vitest):**
  - `pnpm test -- --watch` for red/green loops.
  - Use `tests/fixtures` and `msw` for network mocks.
- **E2E (Playwright):**
  - `pnpm test:e2e -- --headed --project=chromium` locally.
  - Env: start dev server (`pnpm dev`) or use `next dev --turbo`.
- **Coverage:** `pnpm test:coverage` → html/text reports.

## Tooling for DX
- **Editor:** VS Code with recommended extensions: ESLint, Prettier, Prisma, Tailwind CSS IntelliSense, Playwright, Vitest.
- **Storybook (optional):** Consider for UI review if needed; otherwise rely on shadcn docs + visual regression via Playwright screenshots.
- **Env Management:** `.env.local` with `cp .env.example .env.local`; use `dotenv-flow` if needed.
- **API Mocking:** MSW for integration/unit; avoid hitting live services in tests.
- **Logs:** Use Pino pretty transport in dev; JSON in prod.

## Performance Guardrails in Dev
- Prefer RSC; avoid heavy client bundles.
- Run `next lint` and `next analyze` for bundle insight (optional script `pnpm analyze`).

## Database Tooling
- Prisma Studio: `pnpm prisma:studio` for local data inspect.
- Migrations: `pnpm prisma:migrate` (dev), `pnpm prisma migrate deploy` (CI/CD).

## Accessibility & QA
- `@axe-core/playwright` optional in E2E for critical flows.
- Story-level a11y checks when using Storybook.

## Feature Flags
- Env-driven flags for dev; ensure sensible defaults for offline dev.

## Caching & Proxy
- Use Next.js built-in cache; disable ISR caching in dev by default.

## Observability in Dev
- Sentry disabled locally; use console/Pino.
- Otel exporter can be no-op in dev to reduce noise.
