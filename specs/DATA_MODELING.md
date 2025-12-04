# FleetFusion Data Modeling Specification

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft

## Principles
- Multi-tenant by design: every domain entity ties to `organizationId`.
- Alignment between Prisma schema, TypeScript types, and Zod schemas.
- Soft deletes where appropriate (users, loads, documents) with `deletedAt`.
- Auditability: `createdAt`, `updatedAt`, `createdById`, `updatedById` where relevant.

## Core Models (Prisma 7 sketch)
```prisma
enum SubscriptionTier { starter growth enterprise }
enum SubscriptionStatus { trial active past_due cancelled suspended }
enum UserRole { admin manager dispatcher driver compliance accountant viewer }

enum LoadStatus {
  pending assigned dispatched at_pickup picked_up en_route at_delivery delivered
  pod_required completed invoiced paid cancelled
}

enum VehicleStatus { active inactive maintenance decommissioned }

enum DriverStatus { active inactive suspended terminated }

enum DocumentStatus { valid expiring expired pending rejected }

enum IftaReportStatus { draft final filed }

model Organization {
  id                 String   @id @default(cuid())
  name               String
  slug               String   @unique
  subscriptionTier   SubscriptionTier   @default(starter)
  subscriptionStatus SubscriptionStatus @default(trial)
  trialEndsAt        DateTime?
  billingEmail       String?
  members            OrganizationMembership[]
  users              User[]
  vehicles           Vehicle[]
  drivers            Driver[]
  loads              Load[]
  documents          Document[]
  iftaReports        IftaReport[]
  auditLogs          AuditLog[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model User {
  id         String   @id @default(cuid())
  clerkId    String   @unique
  email      String   @unique
  firstName  String?
  lastName   String?
  imageUrl   String?
  memberships OrganizationMembership[]
  auditLogs  AuditLog[] @relation("AuditActor")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?
}

model OrganizationMembership {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           UserRole @default(viewer)

  user          User         @relation(fields: [userId], references: [id])
  organization  Organization @relation(fields: [organizationId], references: [id])

  @@unique([userId, organizationId])
}

model Load {
  id              String   @id @default(cuid())
  organizationId  String
  number          String   @unique
  customerId      String?
  status          LoadStatus @default(pending)
  originCity      String
  originState     String
  destinationCity String
  destinationState String
  pickupDate      DateTime
  deliveryDate    DateTime
  rate            Decimal   @db.Decimal(10,2)
  driverId        String?
  vehicleId       String?
  createdById     String?
  updatedById     String?

  organization Organization @relation(fields: [organizationId], references: [id])
  driver       Driver?      @relation(fields: [driverId], references: [id])
  vehicle      Vehicle?     @relation(fields: [vehicleId], references: [id])
  statusEvents LoadStatusEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([organizationId, status])
  @@index([organizationId, pickupDate])
}

model LoadStatusEvent {
  id             String   @id @default(cuid())
  loadId         String
  organizationId String
  status         LoadStatus
  note           String?
  occurredAt     DateTime @default(now())
  lat            Float?
  lng            Float?
  createdById    String?

  load          Load        @relation(fields: [loadId], references: [id])
  organization  Organization @relation(fields: [organizationId], references: [id])
}

model Vehicle {
  id             String   @id @default(cuid())
  organizationId String
  vin            String
  unitNumber     String
  type           String
  status         VehicleStatus @default(active)
  year           Int?
  make           String?
  model          String?
  licensePlate   String?
  inspections    Inspection[]
  maintenances   Maintenance[]
  documents      Document[]

  organization Organization @relation(fields: [organizationId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@unique([organizationId, vin])
  @@unique([organizationId, unitNumber])
}

model Driver {
  id             String   @id @default(cuid())
  organizationId String
  userId         String?
  name           String
  status         DriverStatus @default(active)
  cdlNumber      String?
  cdlState       String?
  cdlClass       String?
  cdlExpiresAt   DateTime?
  medicalCardExpiresAt DateTime?
  documents      Document[]

  organization Organization @relation(fields: [organizationId], references: [id])
  user         User?        @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([organizationId, status])
}

model Document {
  id             String   @id @default(cuid())
  organizationId String
  entityType     String   // driver | vehicle | org
  entityId       String
  type           String
  status         DocumentStatus @default(valid)
  storageKey     String
  fileName       String
  mimeType       String
  sizeBytes      Int
  expiresAt      DateTime?
  uploadedById   String?

  organization Organization @relation(fields: [organizationId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([organizationId, entityType, entityId])
  @@index([organizationId, expiresAt])
}

model IftaReport {
  id             String   @id @default(cuid())
  organizationId String
  year           Int
  quarter        Int
  status         IftaReportStatus @default(draft)
  trips          IftaTrip[]
  fuelPurchases  IftaFuelPurchase[]

  organization Organization @relation(fields: [organizationId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@unique([organizationId, year, quarter])
}

model IftaTrip {
  id             String   @id @default(cuid())
  organizationId String
  reportId       String?
  vehicleId      String
  tripDate       DateTime
  originState    String
  destinationState String
  jurisdictionMiles Json   // { "IL": 120, "MI": 80 }

  organization Organization @relation(fields: [organizationId], references: [id])
  report       IftaReport?  @relation(fields: [reportId], references: [id])
  vehicle      Vehicle      @relation(fields: [vehicleId], references: [id])
}

model IftaFuelPurchase {
  id             String   @id @default(cuid())
  organizationId String
  reportId       String?
  vehicleId      String
  purchaseDate   DateTime
  jurisdiction   String
  gallons        Decimal @db.Decimal(10,3)
  amount         Decimal @db.Decimal(10,2)
  receiptUrl     String?

  organization Organization @relation(fields: [organizationId], references: [id])
  report       IftaReport?  @relation(fields: [reportId], references: [id])
  vehicle      Vehicle      @relation(fields: [vehicleId], references: [id])
}

model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  actorId        String?
  action         String
  entityType     String
  entityId       String?
  data           Json?
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])
  actor        User?        @relation("AuditActor", fields: [actorId], references: [id])

  @@index([organizationId, createdAt])
}

model WebhookEvent {
  id             String   @id @default(cuid())
  svixId         String   @unique
  organizationId String?
  type           String
  payload        Json
  processedAt    DateTime?
  createdAt      DateTime @default(now())
}
```

## Data Integrity & Constraints
- Unique per org where appropriate (vin, unitNumber, load number, report quarter).
- Foreign keys always include org linkage when relevant.
- Soft delete via `deletedAt`; queries default to `deletedAt = null`.

## Derived / Cached Data
- Materialized views (future) for analytics; otherwise computed via queries.
- Aggregations for IFTA (miles, gallons) computed per report.

## Validation Alignment
- Zod schemas mirror Prisma types; enums defined once in `types` and reused.
- Server actions parse inputs with Zod before hitting Prisma.

## Audit Logging
- All destructive or security-sensitive operations log to `AuditLog` with actor + org + entity.

## Migration Strategy
- Prisma Migrate with Neon branches per environment.
- Backfill scripts for existing data (if migrating from prior version).
