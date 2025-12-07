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
    - **Domain-Driven**: Place code in `src/app/[domain]`.
4.  **VALIDATE**: Run tests (`pnpm test`, `pnpm test:e2e`).
5.  **REFLECT**: Refactor and update docs.
6.  **HANDOFF**: Create a PR with the [template](.github/PULL_REQUEST_TEMPLATE.md).

## 📂 Project Structure

- `src/app/[domain]/`: The core application, organized by domain (Dispatch, Vehicles, etc.).
- `src/lib/`: Shared utilities (RBAC, Date handling, etc.).
- `specs/`: The source of truth for all requirements.

## 📝 Commit Guidelines

We use **Conventional Commits**. Please see `.github/instructions/copilot-commit.md` for details.

```bash
feat(dispatch): add drag-and-drop assignment
fix(auth): resolve race condition in org switching
```

## ✅ Spec Synchronization Checklist

**Maintainers must perform this check before merging PRs:**

1.  [ ] **File Location:** Does the new code reside in `src/app/[domain]/`?
2.  [ ] **Naming:** Do file names match `[domain]Actions.ts`, `[domain]Fetchers.ts`?
3.  [ ] **Exports:** Are all Actions marked `'use server'`?
4.  [ ] **Tests:** Do `tests/` contain files matching the new Actions/Fetchers?
5.  [ ] **Schema:** Is there a Zod schema in `schemas/` for every mutation?
6.  [ ] **Tree Parity:** Does the `specs/domains/[DOMAIN].md` file list the new features?

## 🤖 Copilot Operational Profile

**When acting as an agent on this repo, Copilot MUST:**

1.  **Scan `src/app` first** to identify existing domains.
2.  **Read `src/app/[domain]/schemas/*.ts`** before writing any form or action code.
3.  **Place new logic** in `src/app/[domain]/lib/` (never in root `lib/`).
4.  **Write tests** in `src/app/[domain]/tests/` immediately after implementing logic.
5.  **Use `src/components/ui`** for all UI elements (Buttons, Cards, Inputs).
6.  **Respect `src/lib/server/auth.ts`** for all auth checks (`requireOrgContext`).
