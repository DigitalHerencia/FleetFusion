# The Maximal Template™ — Governance Directory

This file is the directory for repository governance.

It does not define product requirements, architecture, design rules, implementation instructions, validation policy, or execution state. Those responsibilities belong to the files listed below.

## Human-readable intent

`context/docs/` contains the durable human-readable description of the product and implemented system.

```text
context/docs/
├── architecture.md
├── auth.md
├── design.md
├── prd.md
└── tech-requirements.md
```

| File | Responsibility |
| --- | --- |
| `architecture.md` | Implemented application architecture and responsibility boundaries |
| `auth.md` | Authentication, authorization, tenancy, onboarding, and access intent |
| `design.md` | Visual system and presentation intent |
| `prd.md` | Product purpose, capabilities, access model, and product requirements |
| `tech-requirements.md` | Technical implementation and validation requirements |

## Build instructions

`context/specs/` contains scoped implementation instructions formatted as issues.

```text
context/specs/
├── 00.architectural-contract.md
├── 01.route-topology-public-demo.md
├── 02.design-system.md
├── 03.block-library.md
├── 04.crm-golden-vertical-slice.md
├── 05.application-library-normalization.md
├── 06.maximal-template-explorer.md
└── 07.provider-integrations.md
```

Specs describe implementation work and acceptance criteria.

They do not override current explicit owner instruction.

## Machine-readable contracts

`.agents/contracts/` contains deterministic machine-readable translations of human intent.

```text
.agents/contracts/
├── product.yaml
├── design.yaml
└── validation.yaml
```

| File | Responsibility |
| --- | --- |
| `product.yaml` | Product, architecture, route, access, and application-boundary contract |
| `design.yaml` | Design-system and presentation contract |
| `validation.yaml` | Validation commands, evidence rules, and deterministic checks |

Contracts translate the human governance.

They do not create independent product intent.

## Codex execution state

`.agents/execution/` contains mutable Codex execution records.

```text
.agents/execution/
├── decisions.json
├── progress.json
└── handoff.json
```

| File | Responsibility |
| --- | --- |
| `decisions.json` | Decisions recorded during implementation work |
| `progress.json` | Work performed, status, and validation evidence |
| `handoff.json` | Current state and continuation information for the next Codex session |

Execution files record actions and evidence.

They do not define product, architecture, or design requirements.

## Governance relationship

```text
Owner intent
    ↓
context/docs
    ↓
context/specs
    ↓
.agents/contracts

Codex work
    ↓
.agents/execution
```

When clarification of intent is required, the owner is the source of truth.
