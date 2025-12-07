---
description: Generate Pull Request descriptions that align with FleetFusion's Spec-Driven Workflow.
---

# FleetFusion PR Description Instructions

Generate Pull Request descriptions that adhere to the **Phase 6: Handoff** requirements of the Specification-Driven Workflow.

## Template Structure

### 1. Executive Summary

_Use the Compressed Decision Record format:_
`Decision: [What changed] | Rationale: [Why] | Impact: [Consequences] | Review: [Date]`

### 2. Context & Intent

- Link to the relevant Issue or Spec (e.g., "Addresses TODO item #45", "Implements `specs/domains/DISPATCH.md` Section 3.1").
- Briefly explain the _business value_ of this change.

### 3. Changes Implemented

- List key technical changes.
- Highlight any database migrations (`prisma/`).
- Highlight any new Server Actions or Fetchers.

### 4. Validation & Testing

_Proof of Phase 4: Validate_

- [ ] **Automated Tests**: List suites run (e.g., `pnpm test:dispatch`).
- [ ] **Manual Verification**: Describe the steps taken to verify the feature in the UI.
- [ ] **Edge Cases**: Mention any specific edge cases tested.

### 5. Spec Compliance Checklist

- [ ] `PRD.md` updated (if applicable)
- [ ] `TECH_REQUIREMENTS.md` updated (if applicable)
- [ ] Domain Spec (`specs/domains/*.md`) updated
- [ ] `CHANGELOG.md` entry prepared

## Tone and Style

- Professional, concise, and evidence-based.
- Focus on _why_ changes were made, not just _what_.
- Explicitly mention if this PR introduces Technical Debt (and link to the created issue).
