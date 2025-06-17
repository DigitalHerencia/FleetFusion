# FleetFusion Domain Testing Prompts

Below are ready-to-use prompts for writing modern, automated tests in each core domain. Use these for code reviews, AI tools, or onboarding contributors. See the suggested wiki page for each domain for in-depth guidance and examples.

---

## 1. Organization Management 🏢

**Prompt:**

> Write Vitest unit and integration tests for all business logic in `/domains/organization` (including multi-tenant isolation, subscription management, user roles, and settings). Test Org/User/Membership creation, role changes, and tenant boundary enforcement. Use Playwright to cover E2E flows: organization signup, user invites, RBAC UI, and settings updates. Reference `/wiki/organization-testing.md` for test data, edge cases, and test utilities. Ensure CI runs all tests with coverage and updates project/milestone status when critical paths (org creation, role changes) are tested.

## General Guidance

- Always reference the applicable domain wiki, e.g., `/wiki/<domain>-testing.md`, for up-to-date practices, test data, and utilities.
- Use Vitest’s latest features: `mock`, `spy`, snapshot, and coverage.
- For Playwright: leverage fixtures, parallelization, retries, and multi-browser testing.
- Automate all tests with CI (GitHub Actions) and ensure coverage updates and project board integration.
- Document new patterns and edge cases in the relevant wiki.

### MCP Server Tools: 
- .models/mcp.json

### Instructions:
- .models/copilot-instructions.md

### Agents.md:
- .models/agents.md

---

## 2. Vehicle Management 🚚

**Prompt:**

> Write Vitest unit tests for all logic in `/domains/vehicles` (vehicle CRUD, VIN validation, maintenance, compliance checks). Mock external APIs and database as needed. For E2E, use Playwright to automate fleet manager workflows: add/edit vehicles, schedule maintenance, upload compliance docs, and verify dashboards. Consult `/wiki/vehicles-testing.md` for domain-specific test scenarios and common data. Use test coverage/CI automation and document new edge cases in the wiki.

## General Guidance

- Always reference the applicable domain wiki, e.g., `/wiki/<domain>-testing.md`, for up-to-date practices, test data, and utilities.
- Use Vitest’s latest features: `mock`, `spy`, snapshot, and coverage.
- For Playwright: leverage fixtures, parallelization, retries, and multi-browser testing.
- Automate all tests with CI (GitHub Actions) and ensure coverage updates and project board integration.
- Document new patterns and edge cases in the relevant wiki.

### MCP Server Tools: 
- .models/mcp.json

### Instructions:
- .models/copilot-instructions.md

### Agents.md:
- .models/agents.md

---

## 3. Driver Management 👨‍✈️

**Prompt:**

> Create Vitest unit/integration tests for `/domains/drivers` (driver onboarding, HOS compliance, performance tracking, credential validation). Use Playwright for E2E: driver sign-up, HOS logging, performance review, and compliance alert handling. Reference `/wiki/drivers-testing.md` for real-world driver scenarios and regulatory test cases. Apply test mocks for auth and time-based logic. Ensure all tests run in CI and update analytics on coverage.

## General Guidance

- Always reference the applicable domain wiki, e.g., `/wiki/<domain>-testing.md`, for up-to-date practices, test data, and utilities.
- Use Vitest’s latest features: `mock`, `spy`, snapshot, and coverage.
- For Playwright: leverage fixtures, parallelization, retries, and multi-browser testing.
- Automate all tests with CI (GitHub Actions) and ensure coverage updates and project board integration.
- Document new patterns and edge cases in the relevant wiki.

### MCP Server Tools: 
- .models/mcp.json

### Instructions:
- .models/copilot-instructions.md

### Agents.md:
- .models/agents.md

---

## 4. Dispatch & Load Management 🚦

**Prompt:**

> Implement Vitest tests for `/domains/dispatch` (load assignment, route planning, driver/load matching). Validate business rules (equipment match, time windows, rate confirmations) and negative cases (unavailable driver, invalid route). Write Playwright E2E tests for dispatcher UI: posting loads, assigning drivers, and live tracking. See `/wiki/dispatch-testing.md` for workflow diagrams and sample data. Optimize tests for speed and reliability in CI.

## General Guidance

- Always reference the applicable domain wiki, e.g., `/wiki/<domain>-testing.md`, for up-to-date practices, test data, and utilities.
- Use Vitest’s latest features: `mock`, `spy`, snapshot, and coverage.
- For Playwright: leverage fixtures, parallelization, retries, and multi-browser testing.
- Automate all tests with CI (GitHub Actions) and ensure coverage updates and project board integration.
- Document new patterns and edge cases in the relevant wiki.

### MCP Server Tools: 
- .models/mcp.json

### Instructions:
- .models/copilot-instructions.md

### Agents.md:
- .models/agents.md

---

## 5. Compliance Management 📋

**Prompt:**

> Write Vitest unit/integration tests for `/domains/compliance` (document upload, alert scheduling, audit trails, retention logic). Simulate document expiry, violation alerts, and audit log immutability. Use Playwright for E2E: compliance doc upload, expiring doc notifications, and alert remediation flow. Reference `/wiki/compliance-testing.md` for regulatory edge cases and automation tips. All tests must run in CI and surface coverage metrics.

## General Guidance

- Always reference the applicable domain wiki, e.g., `/wiki/<domain>-testing.md`, for up-to-date practices, test data, and utilities.
- Use Vitest’s latest features: `mock`, `spy`, snapshot, and coverage.
- For Playwright: leverage fixtures, parallelization, retries, and multi-browser testing.
- Automate all tests with CI (GitHub Actions) and ensure coverage updates and project board integration.
- Document new patterns and edge cases in the relevant wiki.

### MCP Server Tools: 
- .models/mcp.json

### Instructions:
- .models/copilot-instructions.md

### Agents.md:
- .models/agents.md

---

## 6. IFTA Reporting ⛽

**Prompt:**

> Build Vitest tests for `/domains/ifta` (trip/fuel logging, tax calculations, report generation). Check for complete and accurate trip/fuel records, invalid receipts, and quarterly report deadlines. Use Playwright for E2E: trip entry, fuel upload, and IFTA report submission. For details on calculation rules and state coverage, see `/wiki/ifta-testing.md`. Enable test retries and parallel execution in CI.

## General Guidance

- Always reference the applicable domain wiki, e.g., `/wiki/<domain>-testing.md`, for up-to-date practices, test data, and utilities.
- Use Vitest’s latest features: `mock`, `spy`, snapshot, and coverage.
- For Playwright: leverage fixtures, parallelization, retries, and multi-browser testing.
- Automate all tests with CI (GitHub Actions) and ensure coverage updates and project board integration.
- Document new patterns and edge cases in the relevant wiki.

### MCP Server Tools: 
- .models/mcp.json

### Instructions:
- .models/copilot-instructions.md

### Agents.md:
- .models/agents.md

---

## 7. Analytics & Reporting 📊

**Prompt:**

> Write Vitest tests for `/domains/analytics` (KPI calculations, dashboard metrics, report scheduling). Mock data sources and time-series inputs. Playwright E2E should cover: dashboard loading, KPI filters, download/export features, and access controls. Consult `/wiki/analytics-testing.md` for metric definitions and standard test datasets. Ensure tests are automated, comprehensive, and results update the coverage badge and project board.

## General Guidance

- Always reference the applicable domain wiki, e.g., `/wiki/<domain>-testing.md`, for up-to-date practices, test data, and utilities.
- Use Vitest’s latest features: `mock`, `spy`, snapshot, and coverage.
- For Playwright: leverage fixtures, parallelization, retries, and multi-browser testing.
- Automate all tests with CI (GitHub Actions) and ensure coverage updates and project board integration.
- Document new patterns and edge cases in the relevant wiki.

### MCP Server Tools: 
- .models/mcp.json

### Instructions:
- .models/copilot-instructions.md

### Agents.md:
- .models/agents.md

---

## General Guidance

- Always reference the applicable domain wiki, e.g., `/wiki/<domain>-testing.md`, for up-to-date practices, test data, and utilities.
- Use Vitest’s latest features: `mock`, `spy`, snapshot, and coverage.
- For Playwright: leverage fixtures, parallelization, retries, and multi-browser testing.
- Automate all tests with CI (GitHub Actions) and ensure coverage updates and project board integration.
- Document new patterns and edge cases in the relevant wiki.

### MCP Server Tools: 
- .models/mcp.json

### Instructions:
- .models/copilot-instructions.md

### Agents.md:
- .models/agents.md

---