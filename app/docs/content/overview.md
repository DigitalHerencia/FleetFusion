# FleetFusion at a glance

FleetFusion is a fleet operations platform for trucking companies. It connects the records and daily workflows that otherwise tend to live in separate dispatch, compliance, and reporting tools.

## Who uses it

| Role                   | Typical focus                                                             |
| ---------------------- | ------------------------------------------------------------------------- |
| Owner or administrator | Organization setup, access, fleet utilization, and subscription oversight |
| Dispatcher             | Load creation, driver and vehicle assignment, and status follow-up        |
| Driver                 | Assigned work, shift activity, and document submission                    |
| Compliance manager     | Driver and vehicle documents, due dates, and audit readiness              |
| Accountant             | Fuel and mileage records, IFTA preparation, and reporting                 |

The exact permissions depend on the organization’s role and policy. Use [Users and roles](/docs/admin-guides/users-and-roles) for the access model.

## Main work areas

- **Dispatch** coordinates loads and assignments and records load-status changes.
- **Vehicles and drivers** maintain the people and equipment records used by operations.
- **Compliance** keeps required documents and expiration follow-up visible.
- **IFTA** brings trip miles and fuel purchases together for quarterly reporting.
- **Analytics** summarizes cross-domain operating measures and supports custom reports.
- **Settings and notifications** help administrators manage workspace access and users choose how alerts reach them.

## How data and actions are handled

FleetFusion follows a server-first application model. Pages retrieve organization-scoped data, and validated server actions perform changes after permission checks. The interface may update promptly after an action, but access controls and tenant scoping remain enforced on the server.

This guide describes the product areas at a high level. For hands-on workflows, start with [Getting started](/docs/user-docs/getting-started) or choose a topic from the [documentation home](/docs).
