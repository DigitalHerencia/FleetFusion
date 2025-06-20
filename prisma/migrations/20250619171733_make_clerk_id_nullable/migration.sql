-- DropForeignKey
ALTER TABLE "compliance_alerts" DROP CONSTRAINT "compliance_alerts_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "compliance_alerts" DROP CONSTRAINT "compliance_alerts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "compliance_alerts" DROP CONSTRAINT "compliance_alerts_vehicle_id_fkey";

-- DropIndex
DROP INDEX "compliance_alerts_acknowledged_idx";

-- DropIndex
DROP INDEX "compliance_alerts_due_date_idx";

-- DropIndex
DROP INDEX "compliance_alerts_entityId_idx";

-- DropIndex
DROP INDEX "compliance_alerts_entityType_idx";

-- DropIndex
DROP INDEX "compliance_alerts_resolved_idx";

-- DropIndex
DROP INDEX "compliance_alerts_severity_idx";

-- DropIndex
DROP INDEX "compliance_alerts_type_idx";

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "clerk_id" DROP NOT NULL;
