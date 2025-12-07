# Contributing to FleetFusion

Thank you for your interest in contributing to FleetFusion! We follow a strict **Specification-Driven Workflow** to ensure quality, security, and maintainability.

## 🚀 Getting Started

1.  **Prerequisites**:
    - Node.js v20+
    - pnpm v9+ (`npm install -g pnpm`)
    - Docker (for local Postgres)

2.  **Setup**:

    ```bash
    git clone https://github.com/DigitalHerencia/FleetFusion.git
    cd FleetFusion
    pnpm install
    pnpm prisma:generate
    ```

3.  **Environment**:
    Copy `.env.example` to `.env` and configure your local keys.

## 🛠️ The Workflow

We do not merge code without a plan. Every feature follows the **6-Phase Loop**:

1.  **ANALYZE**: Understand the requirement. Update `PRD.md` and `TECH_REQUIREMENTS.md`.
2.  **DESIGN**: Plan the implementation. Update `specs/domains/*.md`.
3.  **IMPLEMENT**: Write code.
    - **Server-First**: Use Server Components by default.
    - **Domain-Driven**: Place code in `src/app/(tenant)/[orgId]/[domain]`.
4.  **VALIDATE**: Run tests (`pnpm test`, `pnpm test:e2e`).
5.  **REFLECT**: Refactor and update docs.
6.  **HANDOFF**: Create a PR with the [template](.github/PULL_REQUEST_TEMPLATE.md).

## 📂 Project Structure

- `src/app/(tenant)/[orgId]/`: The core application, organized by domain (Dispatch, Vehicles, etc.).
- `src/lib/`: Shared utilities (RBAC, Date handling, etc.).
- `specs/`: The source of truth for all requirements.

## 📝 Commit Guidelines

We use **Conventional Commits**. Please see `.github/instructions/copilot-commit.md` for details.

```bash
feat(dispatch): add drag-and-drop assignment
fix(auth): resolve race condition in org switching
```

## 🧪 Testing

- **Unit Tests**: `pnpm test` (Vitest)
- **E2E Tests**: `pnpm test:e2e` (Playwright)

All PRs must pass CI checks before merging.
