# Test-First Plan (No Mocks)

## Source of Truth
- Use specs in `specs/` (PRD, TECH_REQUIREMENTS, SECURITY, domains/*), Prisma schema, and domain architecture guides (`.agent/DomainArchitecture.md`, `.github/instructions/coplilot-stubs.md`, `copilot-instructions.md`).
- Treat data models from `prisma/schema.prisma` as canonical entities and relationships.
- Permission/role expectations derive from SECURITY.md (roles) + domain docs; solidify an explicit permission matrix in tests.

## Test Strategy
- Write failing tests first for `auth.ts`, `rbac.ts`, cache helpers, and each domain’s actions/fetchers/validation/pageview.
- No mocks: use real Prisma client pointed at a test database (Postgres URL via env); seed minimal fixtures per test suite (org, user, membership, baseline entities).
- Actions: assert Zod validation, org scoping, RBAC enforcement, Prisma mutation, cache revalidation, and normalized DTO shapes.
- Fetchers: assert org scoping, ordering/pagination, DTO normalization, and role/permission gates where required.
- Pageviews: assert they call fetchers, render expected data shape, and surface loading/error boundaries.
- Validation: assert schemas enforce required fields, formats, and domain rules (e.g., VIN uniqueness via DB constraint where applicable).

## Decision Rules
- When specs leave gaps (e.g., per-action permissions), define a concrete permission matrix in tests, then implement code to satisfy it.
- Derive required fields and behaviors from domain markdowns and Prisma schema; when ambiguous, choose conservative defaults (validate more, restrict more) and encode in tests.
- Cache tags: define per-domain tags in tests (e.g., `vehicles.list`, `dispatch.board`) and require actions to revalidate them.

## Workflow to Ensure Code Follows Tests
1) Author tests per module → run → observe red.
2) Implement corresponding code in stubs to satisfy tests → run until green.
3) Repeat domain by domain (start with auth/rbac/cache, then vehicles, then dispatch/drivers/compliance/etc.).
4) Keep tests integration-style (real DB) so behavior matches production expectations.

## Environment
- Use `DATABASE_URL` for Postgres test DB; migrations applied before test run; seed data created within test setup/teardown.

## Output
- Real, deterministic tests that directly encode spec requirements; implementations are derived by making tests pass.
