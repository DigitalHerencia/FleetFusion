# .agent Directory

This directory contains AI agent resources, audit reports, and automation scripts for FleetFusion development.

## Contents

| File                   | Purpose                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| `AuditReport.md`       | Full workspace audit with findings, compliance checks, and remediation tasks |
| `dev-tasks.ps1`        | PowerShell automation for common development tasks                           |
| `create_structure.ps1` | Project scaffolding automation                                               |
| `directory-tree.txt`   | Project structure snapshot                                                   |

## Using dev-tasks.ps1

Run from the project root:

```powershell
# Check for stub files that need implementation
.\.agent\dev-tasks.ps1 -Task check-stubs

# Audit domain folder structure
.\.agent\dev-tasks.ps1 -Task audit-domains

# Fix Husky hooks
.\.agent\dev-tasks.ps1 -Task fix-husky

# Create e2e folder with smoke tests
.\.agent\dev-tasks.ps1 -Task create-e2e-folder

# Other available tasks
.\.agent\dev-tasks.ps1 -Task lint
.\.agent\dev-tasks.ps1 -Task typecheck
.\.agent\dev-tasks.ps1 -Task test
.\.agent\dev-tasks.ps1 -Task build
.\.agent\dev-tasks.ps1 -Task prisma-status
.\.agent\dev-tasks.ps1 -Task prisma-studio
.\.agent\dev-tasks.ps1 -Task fresh-install
```

## Adding New Scripts

When creating automation scripts:

1. Use `.ps1` extension for PowerShell scripts
2. Include a header comment with synopsis and examples
3. Use `-Task` parameter pattern for multi-function scripts
4. Output progress with colored `Write-Host` messages

## Audit Reports

After each major audit, save the report to this directory:

- Use ISO date format in filename if versioning: `AuditReport-2025-12-07.md`
- Include confidence scores and remediation tasks
- Cross-reference TODO.md items

## Agent Context Files

You can add context files that AI agents should reference:

- `context-*.md` - Domain-specific context
- `patterns-*.md` - Code patterns and examples
- `prompts-*.md` - Reusable prompt templates
