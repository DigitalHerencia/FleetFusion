# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2025-12-06

### Added

- Configured testing infrastructure with `vitest` and `playwright`.
- Created `vitest.config.ts`, `playwright.config.ts`, and `vitest.setup.ts`.
- Generated comprehensive test stubs (TDD preparation) for all domains:
  - **Auth**: Actions, Fetchers, RBAC, Onboarding, Invite Lifecycle.
  - **Dashboard**: Actions, Fetchers, Rules, Hooks, Pageview.
  - **Vehicles**: Actions, Fetchers, Validation, Pageview.
  - **Drivers**: Actions, Fetchers, Mobile Flows.
  - **Dispatch**: Actions, Fetchers, Status Rules, Pageview.
  - **Compliance**: Actions, Fetchers, Expiration Alerts.
  - **IFTA**: Calculations, Reports, Pageview.
  - **Analytics**: Queries, Reports, Pageview.
  - **Settings**: Actions, Fetchers, Pageview.
  - **Notifications**: Routing, Preferences, Pageview.
  - **Admin**: Actions, RBAC, Pageview.

## [0.2.0] - 2025-12-06

### Added

- Initial `TODO.md` outlining full backlog derived from product, technical, architecture, security, data, design, observability, and tooling specs.
- Created `CHANGELOG.md` to track future changes.

## [0.2.0] - 2025-12-06

### Changed

- Migrated package manager to `pnpm` and generated lockfile.
- Upgraded to Tailwind CSS v4 with CSS-first configuration in `globals.css`.
- Removed `tailwind.config.ts` in favor of native CSS variables and `@theme` directives.
- Modernized `tsconfig.json` by removing deprecated `baseUrl` and updating path aliases.
- Refactored `eslint` configuration to use Flat Config (v9) with strict type checking, import sorting, and accessibility rules.
- Updated Prettier configuration with Tailwind plugin and standard formatting rules.

### Added

- Integrated `shadcn/ui` component library with New York style and Zinc theme.
- Added core UI components: Accordion, Alert, Button, Card, Dialog, Dropdown, Form, Input, Sheet, Sidebar, and more.
- Installed necessary dependencies: `lucide-react`, `@radix-ui/react-icons`, `clsx`, `tailwind-merge`.
- Added `@clerk/nextjs` and `lodash` dependencies.

### Removed

- Deleted deprecated and empty UI stub files (`container.tsx`, `data-table.tsx`, `toast.tsx`, etc.).

## [0.1.0] - 2025-12-04

### Added

- Bootstrapped Next.js App Router structure with `(marketing)`, `(auth)`, and tenant `(tenant)/[orgId]` groups plus domain placeholders.
- Established tooling baseline (pnpm, strict TypeScript paths, ESLint 9 flat config, Tailwind CSS 4 tokens, PostCSS) and shared utilities.
- Added health/readiness API probes and middleware scaffold for future tenant/auth gating.
