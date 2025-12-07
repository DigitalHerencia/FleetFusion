# FleetFusion Product Requirements Document (PRD)

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft  
**Author:** FleetFusion Engineering Team

---

## Executive Summary

FleetFusion is a next-generation, multi-tenant SaaS platform designed for trucking companies and fleet managers. The platform provides a unified solution for dispatch management, vehicle and driver tracking, regulatory compliance, IFTA reporting, and business analytics.

This document defines the product requirements for a complete rebuild using modern technologies:

- **Next.js 16** with App Router and React Server Components
- **React 19** with server actions and optimistic updates
- **Clerk 6** for authentication with custom RBAC (no Clerk organizations)
- **Prisma 7** with Neon PostgreSQL for multi-tenant data
- **Tailwind CSS 4** with custom design system

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Users](#2-target-users)
3. [Subscription Tiers](#3-subscription-tiers)
4. [Feature Domains](#4-feature-domains)
5. [User Stories](#5-user-stories)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Success Metrics](#8-success-metrics)

---

## 1. Product Vision

### 1.1 Problem Statement

Small-to-medium trucking companies (5-100 trucks) struggle with:

- Fragmented software systems for dispatch, compliance, and billing
- Manual processes prone to errors and delays
- Difficulty maintaining DOT/FMCSA regulatory compliance
- Lack of real-time visibility into fleet operations
- Complex IFTA tax reporting across jurisdictions

### 1.2 Solution

FleetFusion provides an integrated Transportation Management System (TMS) that:

- Unifies dispatch, compliance, and analytics in a single platform
- Automates regulatory compliance tracking and reminders
- Provides real-time fleet visibility with mobile driver apps
- Simplifies IFTA reporting with automated mileage and fuel tracking
- Scales from startups to enterprise fleets with tiered pricing

### 1.3 Core Value Propositions

| Stakeholder        | Value Delivered                                     |
| ------------------ | --------------------------------------------------- |
| Fleet Owner        | Reduced operational costs, compliance peace of mind |
| Dispatcher         | Efficient load assignment, real-time status updates |
| Driver             | Mobile access to assignments, simplified paperwork  |
| Compliance Manager | Automated document tracking, expiration alerts      |
| Accountant         | Accurate IFTA reports, streamlined billing          |

---

## 2. Target Users

### 2.1 Primary Personas

#### Fleet Owner / Admin

- **Role:** Business owner or operations manager
- **Goals:** Maximize fleet utilization, minimize costs, ensure compliance
- **Pain Points:** Lack of visibility, compliance violations, driver management
- **Tech Comfort:** Moderate; needs intuitive interfaces

#### Dispatcher

- **Role:** Coordinates loads between drivers and customers
- **Goals:** Optimize load assignments, track deliveries in real-time
- **Pain Points:** Manual communication, status update delays
- **Tech Comfort:** High; power user of TMS features

#### Driver

- **Role:** Operates vehicle and delivers loads
- **Goals:** Clear assignments, minimize paperwork, log hours
- **Pain Points:** Confusing apps, duplicate data entry
- **Tech Comfort:** Variable; needs mobile-first, simple UI

#### Compliance Officer

- **Role:** Ensures DOT/FMCSA regulatory compliance
- **Goals:** Track certifications, audits, document renewals
- **Pain Points:** Manual tracking, missed expirations
- **Tech Comfort:** Moderate; needs clear dashboards

### 2.2 Organization Sizes

| Segment | Fleet Size    | Users | Typical Tier        |
| ------- | ------------- | ----- | ------------------- |
| Startup | 1-5 trucks    | 2-5   | Starter             |
| Small   | 6-25 trucks   | 5-15  | Growth              |
| Medium  | 26-100 trucks | 15-50 | Enterprise          |
| Large   | 100+ trucks   | 50+   | Enterprise (Custom) |

---

## 3. Subscription Tiers

### 3.1 Tier Comparison

| Feature                 | Starter    | Growth       | Enterprise                 |
| ----------------------- | ---------- | ------------ | -------------------------- |
| **Price**               | $149/month | $349/month   | $15/truck/month (min $699) |
| **Trucks**              | Up to 5    | Up to 25     | Unlimited                  |
| **Dispatchers**         | 2          | Unlimited    | Unlimited                  |
| **Driver App Users**    | 5          | 25           | Unlimited                  |
| **Dispatch Board**      | ✅         | ✅           | ✅                         |
| **Vehicle Management**  | ✅         | ✅           | ✅                         |
| **Driver Management**   | ✅         | ✅           | ✅                         |
| **Document Storage**    | 5 GB       | 25 GB        | Unlimited                  |
| **Compliance Tracking** | Basic      | Advanced     | Advanced + Audit           |
| **IFTA Reporting**      | ❌         | ✅           | ✅                         |
| **Custom Reports**      | ❌         | ✅           | ✅                         |
| **Analytics Dashboard** | Basic      | Full         | Full + Custom              |
| **API Access**          | ❌         | ❌           | ✅                         |
| **SSO/SAML**            | ❌         | ❌           | ✅                         |
| **Priority Support**    | Email      | Email + Chat | Dedicated CSM              |
| **SLA**                 | 99.5%      | 99.9%        | 99.95%                     |

### 3.2 Freemium Model

- **Trial Period:** 14-day free trial of Growth tier features
- **Feature Gates:** Subscription tier controls feature access at runtime
- **Overage Handling:** Soft limits with upgrade prompts
- **Downgrade Policy:** Data retained, features locked after tier change

### 3.3 Subscription Data Model

```typescript
interface SubscriptionSettings {
  tier: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'suspended';
  trialEndsAt: Date | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;

  // Usage limits
  maxTrucks: number;
  maxDispatchers: number;
  maxDrivers: number;
  maxStorageGb: number;

  // Feature flags
  iftaEnabled: boolean;
  customReportsEnabled: boolean;
  apiAccessEnabled: boolean;
  ssoEnabled: boolean;
}
```

---

## 4. Feature Domains

### 4.1 Domain Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FleetFusion                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  AUTH   │  │DISPATCH │  │VEHICLES │  │ DRIVERS │            │
│  │         │  │         │  │         │  │         │            │
│  │• Sign-up│  │• Loads  │  │• Fleet  │  │• Roster │            │
│  │• Login  │  │• Board  │  │• Maint. │  │• HOS    │            │
│  │• RBAC   │  │• Status │  │• Inspect│  │• Certs  │            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │COMPLIANC│  │  IFTA   │  │ANALYTICS│  │SETTINGS │            │
│  │         │  │         │  │         │  │         │            │
│  │• Docs   │  │• Trips  │  │• KPIs   │  │• Company│            │
│  │• Expiry │  │• Fuel   │  │• Reports│  │• Users  │            │
│  │• Audits │  │• Reports│  │• Export │  │• Billing│            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Domain Descriptions

| Domain         | Description                                        | Key Entities                           |
| -------------- | -------------------------------------------------- | -------------------------------------- |
| **Auth**       | Authentication, authorization, user management     | User, Session, Permission              |
| **Dispatch**   | Load lifecycle, driver assignment, status tracking | Load, Customer, Assignment             |
| **Vehicles**   | Fleet inventory, maintenance, inspections          | Vehicle, Maintenance, Inspection       |
| **Drivers**    | Driver profiles, certifications, HOS logs          | Driver, CDL, MedicalCard, HosLog       |
| **Compliance** | Document management, expiration tracking           | Document, ComplianceAlert              |
| **IFTA**       | Fuel tax reporting by jurisdiction                 | IftaReport, IftaTrip, FuelPurchase     |
| **Analytics**  | Dashboards, KPIs, custom reports                   | Report, Dashboard, Metric              |
| **Settings**   | Organization, user, billing configuration          | Organization, Preference, Subscription |

---

## 5. User Stories

### 5.1 EARS Notation Format

User stories follow the **Easy Approach to Requirements Syntax (EARS)** format:

- **Ubiquitous:** `THE SYSTEM SHALL [expected behavior]`
- **Event-driven:** `WHEN [trigger event], THE SYSTEM SHALL [expected behavior]`
- **State-driven:** `WHILE [in specific state], THE SYSTEM SHALL [expected behavior]`
- **Unwanted behavior:** `IF [unwanted condition], THEN THE SYSTEM SHALL [required response]`
- **Optional:** `WHERE [feature is included], THE SYSTEM SHALL [expected behavior]`

---

### 5.2 Auth Domain Stories

#### AUTH-001: User Registration

**As a** fleet owner,  
**I want to** create an account for my company,  
**So that** I can start managing my fleet.

**EARS Requirements:**

- WHEN a user submits valid registration data, THE SYSTEM SHALL create a Clerk user account and sync to the database.
- WHEN registration completes, THE SYSTEM SHALL create a default organization with the user as admin.
- IF email already exists, THEN THE SYSTEM SHALL display an error without creating duplicate accounts.
- THE SYSTEM SHALL require email verification before granting full access.

#### AUTH-002: User Sign-In

**As a** registered user,  
**I want to** sign in to my account,  
**So that** I can access the platform.

**EARS Requirements:**

- WHEN a user provides valid credentials, THE SYSTEM SHALL authenticate via Clerk and establish a session.
- WHEN authentication succeeds, THE SYSTEM SHALL redirect to the user's organization dashboard.
- IF credentials are invalid, THEN THE SYSTEM SHALL display an error after a configurable delay (brute force protection).
- WHERE SSO is enabled (Enterprise tier), THE SYSTEM SHALL support SAML/OIDC authentication.

#### AUTH-003: Role-Based Access Control

**As an** organization admin,  
**I want to** assign roles to team members,  
**So that** they have appropriate permissions.

**EARS Requirements:**

- THE SYSTEM SHALL enforce role-based permissions for all protected resources.
- WHEN a user's role changes, THE SYSTEM SHALL immediately update their access without requiring re-authentication.
- THE SYSTEM SHALL support the following roles: admin, manager, dispatcher, driver, compliance, accountant, viewer.
- IF a user lacks permission for an action, THEN THE SYSTEM SHALL return a 403 error with clear messaging.

#### AUTH-004: Organization Invitation

**As an** admin,  
**I want to** invite team members to my organization,  
**So that** they can collaborate on fleet management.

**EARS Requirements:**

- WHEN an admin sends an invitation, THE SYSTEM SHALL create a pending invitation record and send an email.
- WHEN an invited user accepts, THE SYSTEM SHALL create their account (if new) and add them to the organization.
- IF an invitation expires (7 days default), THEN THE SYSTEM SHALL mark it as expired and require re-invitation.
- THE SYSTEM SHALL allow admins to revoke pending invitations.

---

### 5.3 Dispatch Domain Stories

#### DISP-001: Create Load

**As a** dispatcher,  
**I want to** create a new load,  
**So that** I can assign it to a driver.

**EARS Requirements:**

- THE SYSTEM SHALL capture: customer, origin, destination, pickup/delivery dates, equipment type, rate.
- WHEN a load is created, THE SYSTEM SHALL assign a unique load number and set status to "pending".
- THE SYSTEM SHALL validate that pickup date is before delivery date.
- IF required fields are missing, THEN THE SYSTEM SHALL display validation errors without saving.

#### DISP-002: Dispatch Board

**As a** dispatcher,  
**I want to** view all loads on a drag-and-drop board,  
**So that** I can manage assignments efficiently.

**EARS Requirements:**

- THE SYSTEM SHALL display loads grouped by status in a Kanban-style board.
- WHEN a user drags a load to a new status column, THE SYSTEM SHALL update the load status.
- THE SYSTEM SHALL display driver and vehicle assignments for each load.
- WHILE the board is open, THE SYSTEM SHALL refresh load statuses via Server-Sent Events.

#### DISP-003: Assign Driver to Load

**As a** dispatcher,  
**I want to** assign a driver and vehicle to a load,  
**So that** the load can be picked up and delivered.

**EARS Requirements:**

- THE SYSTEM SHALL show only active drivers and vehicles available for the load dates.
- WHEN a driver is assigned, THE SYSTEM SHALL update load status to "assigned" and notify the driver.
- IF the selected driver is already assigned to an overlapping load, THEN THE SYSTEM SHALL warn but allow override.
- THE SYSTEM SHALL track assignment history for audit purposes.

#### DISP-004: Load Status Updates

**As a** driver,  
**I want to** update my load status from my mobile device,  
**So that** dispatchers and customers have real-time visibility.

**EARS Requirements:**

- THE SYSTEM SHALL allow status updates: at_pickup, picked_up, en_route, at_delivery, delivered, pod_uploaded.
- WHEN a status is updated, THE SYSTEM SHALL record timestamp and location (if available).
- THE SYSTEM SHALL push real-time updates to dispatchers via SSE.
- IF status update fails due to network, THEN THE SYSTEM SHALL queue and retry when connected.

---

### 5.4 Vehicles Domain Stories

#### VEH-001: Add Vehicle to Fleet

**As a** fleet manager,  
**I want to** add a vehicle to my fleet,  
**So that** I can assign it to loads and track its status.

**EARS Requirements:**

- THE SYSTEM SHALL capture: VIN, unit number, make, model, year, type, license plate.
- THE SYSTEM SHALL validate VIN format and check for duplicates within the organization.
- WHEN a vehicle is added, THE SYSTEM SHALL set status to "active" and create initial inspection records.
- WHERE the vehicle is a trailer, THE SYSTEM SHALL capture trailer-specific attributes.

#### VEH-002: Schedule Maintenance

**As a** fleet manager,  
**I want to** schedule maintenance for a vehicle,  
**So that** I can prevent breakdowns and maintain compliance.

**EARS Requirements:**

- THE SYSTEM SHALL support maintenance types: oil change, tire rotation, DOT inspection, brake service, etc.
- WHEN maintenance is scheduled, THE SYSTEM SHALL update the vehicle's next service date.
- THE SYSTEM SHALL generate compliance alerts 30/14/7 days before maintenance is due.
- WHEN maintenance is completed, THE SYSTEM SHALL record date, mileage, cost, and notes.

#### VEH-003: Vehicle Inspection Logs

**As a** driver,  
**I want to** complete pre-trip and post-trip inspections,  
**So that** I comply with DOT regulations.

**EARS Requirements:**

- THE SYSTEM SHALL provide a mobile-friendly inspection checklist per vehicle type.
- WHEN a defect is reported, THE SYSTEM SHALL flag the vehicle and notify the fleet manager.
- THE SYSTEM SHALL store inspection records for DOT audit periods (6 months minimum).
- IF a critical defect is reported, THEN THE SYSTEM SHALL prevent vehicle dispatch until resolved.

---

### 5.5 Drivers Domain Stories

#### DRV-001: Add Driver Profile

**As a** fleet manager,  
**I want to** add a driver to my organization,  
**So that** I can assign them to loads and track their credentials.

**EARS Requirements:**

- THE SYSTEM SHALL capture: name, contact info, CDL number, CDL class, endorsements, restrictions.
- THE SYSTEM SHALL validate CDL number format by state.
- WHEN a driver is added, THE SYSTEM SHALL create related compliance documents (CDL, medical card).
- THE SYSTEM SHALL link driver to their User account for mobile app access.

#### DRV-002: CDL and Medical Card Tracking

**As a** compliance officer,  
**I want to** track driver license and medical card expirations,  
**So that** I can ensure drivers are legally qualified.

**EARS Requirements:**

- THE SYSTEM SHALL store CDL expiration date, medical card expiration, and DOT physical dates.
- THE SYSTEM SHALL generate alerts at 90/60/30/14/7 days before expiration.
- IF a driver's CDL or medical card expires, THEN THE SYSTEM SHALL prevent load assignment.
- THE SYSTEM SHALL support document uploads for CDL and medical card images.

#### DRV-003: Hours of Service Logging

**As a** driver,  
**I want to** log my hours of service,  
**So that** I comply with FMCSA regulations.

**EARS Requirements:**

- THE SYSTEM SHALL track driving, on-duty, off-duty, and sleeper berth hours.
- THE SYSTEM SHALL enforce 11-hour driving limit and 14-hour on-duty limit.
- IF a driver approaches HOS limits, THEN THE SYSTEM SHALL display warnings.
- THE SYSTEM SHALL provide HOS summary dashboards for compliance officers.

---

### 5.6 Compliance Domain Stories

#### COMP-001: Document Management

**As a** compliance officer,  
**I want to** upload and organize compliance documents,  
**So that** I have them ready for audits.

**EARS Requirements:**

- THE SYSTEM SHALL support document types: CDL, medical card, DOT authority, insurance, IRP, IFTA permit.
- THE SYSTEM SHALL extract expiration dates from document metadata or manual entry.
- THE SYSTEM SHALL organize documents by entity (driver, vehicle, organization).
- THE SYSTEM SHALL provide secure, auditable access to documents.

#### COMP-002: Expiration Alerts

**As a** compliance officer,  
**I want to** receive alerts before documents expire,  
**So that** I can renew them on time.

**EARS Requirements:**

- THE SYSTEM SHALL generate alerts at configurable intervals (default: 90/60/30/14/7 days).
- THE SYSTEM SHALL deliver alerts via email and in-app notification.
- WHEN a document is renewed, THE SYSTEM SHALL dismiss related alerts.
- THE SYSTEM SHALL provide a dashboard of all expiring documents sorted by urgency.

---

### 5.7 IFTA Domain Stories

#### IFTA-001: Trip Mileage Logging

**As a** driver,  
**I want to** log trip mileage by jurisdiction,  
**So that** IFTA taxes can be calculated accurately.

**EARS Requirements:**

- THE SYSTEM SHALL capture: trip date, vehicle, origin state, destination state, miles per jurisdiction.
- THE SYSTEM SHALL support manual entry and GPS-based auto-calculation (future).
- THE SYSTEM SHALL validate that total miles equals sum of jurisdiction miles.
- WHERE IFTA is enabled (Growth/Enterprise), THE SYSTEM SHALL aggregate trips for quarterly reports.

#### IFTA-002: Fuel Purchase Logging

**As a** driver,  
**I want to** log fuel purchases,  
**So that** fuel tax credits can be claimed.

**EARS Requirements:**

- THE SYSTEM SHALL capture: date, vehicle, jurisdiction, gallons, amount, vendor.
- THE SYSTEM SHALL support receipt image uploads.
- THE SYSTEM SHALL validate that fuel purchases are within trip date ranges.
- THE SYSTEM SHALL aggregate fuel by jurisdiction for IFTA reports.

#### IFTA-003: Quarterly IFTA Reports

**As an** accountant,  
**I want to** generate IFTA quarterly reports,  
**So that** I can file fuel taxes accurately.

**EARS Requirements:**

- THE SYSTEM SHALL calculate net tax owed per jurisdiction based on miles and fuel.
- THE SYSTEM SHALL generate reports in IFTA-standard format.
- THE SYSTEM SHALL support export to PDF and Excel.
- THE SYSTEM SHALL track report status: draft, final, filed.

---

### 5.8 Analytics Domain Stories

#### ANLY-001: Dashboard Overview

**As a** fleet owner,  
**I want to** see key metrics on a dashboard,  
**So that** I can monitor fleet performance at a glance.

**EARS Requirements:**

- THE SYSTEM SHALL display: active loads, on-time delivery rate, fleet utilization, revenue.
- THE SYSTEM SHALL support date range filtering.
- THE SYSTEM SHALL refresh metrics in real-time or near-real-time.
- THE SYSTEM SHALL provide drill-down from metrics to detailed data.

#### ANLY-002: Custom Reports

**As a** fleet manager,  
**I want to** create custom reports,  
**So that** I can analyze specific aspects of my operations.

**EARS Requirements:**

- WHERE custom reports are enabled (Growth/Enterprise), THE SYSTEM SHALL provide a report builder.
- THE SYSTEM SHALL support filtering, grouping, and aggregation of data.
- THE SYSTEM SHALL support export to PDF, Excel, and CSV.
- THE SYSTEM SHALL allow saving and scheduling recurring reports.

---

### 5.9 Settings Domain Stories

#### SET-001: Organization Settings

**As an** admin,  
**I want to** configure my organization's settings,  
**So that** the platform reflects my business needs.

**EARS Requirements:**

- THE SYSTEM SHALL capture: company name, DOT number, MC number, address, logo.
- THE SYSTEM SHALL validate DOT and MC number formats.
- WHEN settings change, THE SYSTEM SHALL update the organization record immediately.
- THE SYSTEM SHALL display organization branding throughout the platform.

#### SET-002: User Management

**As an** admin,  
**I want to** manage users in my organization,  
**So that** I can control access and permissions.

**EARS Requirements:**

- THE SYSTEM SHALL list all users with their roles and status.
- THE SYSTEM SHALL allow adding, editing, and deactivating users.
- THE SYSTEM SHALL support role assignment from predefined roles.
- IF a user is deactivated, THEN THE SYSTEM SHALL revoke their access immediately.

#### SET-003: Subscription Management

**As an** admin,  
**I want to** view and manage my subscription,  
**So that** I can upgrade, downgrade, or update billing.

**EARS Requirements:**

- THE SYSTEM SHALL display current tier, usage, and billing information.
- THE SYSTEM SHALL provide upgrade and downgrade options.
- WHEN a subscription changes, THE SYSTEM SHALL update feature access immediately.
- THE SYSTEM SHALL redirect to Stripe for payment method management.

---

## 6. Acceptance Criteria

### 6.1 Definition of Done

A feature is complete when:

1. **Code Complete:** All code written, reviewed, and merged
2. **Tested:** Unit tests (>80% coverage), integration tests, E2E tests pass
3. **Documented:** User docs updated, API docs current
4. **Accessible:** WCAG 2.1 AA compliance verified
5. **Performant:** Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
6. **Secure:** Security review passed, no critical vulnerabilities
7. **Deployed:** Successfully deployed to staging, smoke tests pass

### 6.2 Quality Gates

| Gate          | Criteria                         | Blocker? |
| ------------- | -------------------------------- | -------- |
| Lint          | ESLint 9 passes with 0 errors    | Yes      |
| Type Check    | TypeScript strict mode, 0 errors | Yes      |
| Unit Tests    | Vitest passes, >80% coverage     | Yes      |
| E2E Tests     | Playwright critical paths pass   | Yes      |
| Security Scan | No high/critical vulnerabilities | Yes      |
| Performance   | Lighthouse score >90             | No       |
| Accessibility | axe-core 0 violations            | No       |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric                         | Target        | Measurement      |
| ------------------------------ | ------------- | ---------------- |
| Time to First Byte (TTFB)      | < 200ms       | Vercel Analytics |
| Largest Contentful Paint (LCP) | < 2.5s        | Lighthouse       |
| First Input Delay (FID)        | < 100ms       | Web Vitals       |
| Cumulative Layout Shift (CLS)  | < 0.1         | Lighthouse       |
| API Response Time              | < 500ms (p95) | Server logs      |
| Database Query Time            | < 100ms (p95) | Prisma metrics   |

### 7.2 Scalability

- Support 10,000 concurrent users
- Handle 1,000 requests/second per tenant
- Scale horizontally via Vercel serverless
- Database connection pooling via Neon

### 7.3 Availability

| Tier       | Uptime SLA | Monthly Downtime |
| ---------- | ---------- | ---------------- |
| Starter    | 99.5%      | ~3.6 hours       |
| Growth     | 99.9%      | ~43 minutes      |
| Enterprise | 99.95%     | ~22 minutes      |

### 7.4 Security

- SOC 2 Type II compliance (roadmap)
- GDPR data protection compliance
- Data encryption at rest (AES-256)
- Data encryption in transit (TLS 1.3)
- Regular penetration testing
- Security incident response < 4 hours

### 7.5 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios > 4.5:1
- Focus indicators on all interactive elements

---

## 8. Success Metrics

### 8.1 Business Metrics

| Metric                          | Target   | Timeframe    |
| ------------------------------- | -------- | ------------ |
| Monthly Recurring Revenue (MRR) | $100K    | 12 months    |
| Customer Acquisition Cost (CAC) | < $500   | Per customer |
| Lifetime Value (LTV)            | > $5,000 | Per customer |
| Churn Rate                      | < 5%     | Monthly      |
| Net Promoter Score (NPS)        | > 50     | Quarterly    |

### 8.2 Product Metrics

| Metric                     | Target             | Measurement     |
| -------------------------- | ------------------ | --------------- |
| Daily Active Users (DAU)   | 60% of users       | Analytics       |
| Feature Adoption           | 80% use 3+ domains | Analytics       |
| Time to First Load Created | < 10 minutes       | Onboarding      |
| Load Completion Rate       | > 95%              | Dispatch data   |
| Compliance Alert Response  | < 48 hours         | Compliance data |

### 8.3 Technical Metrics

| Metric                       | Target     | Measurement       |
| ---------------------------- | ---------- | ----------------- |
| Deployment Frequency         | Daily      | CI/CD             |
| Change Failure Rate          | < 5%       | Incident tracking |
| Mean Time to Recovery (MTTR) | < 1 hour   | Incident tracking |
| Test Coverage                | > 80%      | Vitest/Playwright |
| Security Vulnerabilities     | 0 critical | Snyk/Dependabot   |

---

## Appendix A: Glossary

| Term          | Definition                                    |
| ------------- | --------------------------------------------- |
| **CDL**       | Commercial Driver's License                   |
| **DOT**       | Department of Transportation                  |
| **FMCSA**     | Federal Motor Carrier Safety Administration   |
| **HOS**       | Hours of Service regulations                  |
| **IFTA**      | International Fuel Tax Agreement              |
| **IRP**       | International Registration Plan               |
| **Load**      | A freight shipment from origin to destination |
| **MC Number** | Motor Carrier number (FMCSA authority)        |
| **POD**       | Proof of Delivery                             |
| **TMS**       | Transportation Management System              |

---

## Appendix B: Document History

| Version | Date       | Author        | Changes                        |
| ------- | ---------- | ------------- | ------------------------------ |
| 1.0     | 2024-06-01 | Original Team | Initial PRD                    |
| 2.0     | 2025-12-04 | Engineering   | Complete rebuild specification |

---

## Appendix C: Related Documents

- [TECH_REQUIREMENTS.md](./TECH_REQUIREMENTS.md) - Technical architecture and stack
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture specification
- [SECURITY.md](./SECURITY.md) - Security and compliance specification
- [DATA_MODELING.md](./DATA_MODELING.md) - Database schema and data models
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - UI component library and branding
- [OBSERVABILITY.md](./OBSERVABILITY.md) - Logging, monitoring, and alerting
- [Domain Specifications](./domains/) - Feature domain specifications
