---
description: Generate semantic commit messages tailored to FleetFusion's domain-driven architecture.
---

# FleetFusion Commit Message Instructions

Generate commit messages that follow the **Conventional Commits** specification, strictly tailored to the FleetFusion domain structure.

## Format

`<type>(<scope>): <description>`

## Allowed Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation
- `db`: Prisma schema changes or migrations
- `ci`: CI/CD configuration changes

## Allowed Scopes (Domain-Driven)

Use the folder name from `src/app/(tenant)/[orgId]/` or `src/lib` as the scope.

- `auth` (Clerk, middleware)
- `dispatch`
- `vehicles`
- `drivers`
- `compliance`
- `ifta`
- `settings`
- `admin`
- `ui` (Shared components in `src/components`)
- `core` (Shared lib, utils, config)
- `specs` (Documentation in `specs/`)

## Rules

1. **Imperative Mood**: Use "add" not "added", "fix" not "fixed".
2. **No Period**: Do not end the subject line with a period.
3. **Reference Specs**: If the commit implements a specific spec requirement, reference it in the body (e.g., "Implements REQ-123 from PRD").
4. **Breaking Changes**: Indicate breaking changes with a `!` after the type/scope (e.g., `feat(api)!: ...`) and a `BREAKING CHANGE:` footer.

## Example

`feat(dispatch): add drag-and-drop assignment for unassigned loads`
`fix(auth): resolve race condition in org switching logic`
`db(schema): add index to vehicle_telemetry table`
