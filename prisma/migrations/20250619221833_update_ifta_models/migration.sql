/*
  Warnings:

  - You are about to drop the column `log` on the `IftaPDFGenerationLog` table. All the data in the column will be lost.
  - You are about to drop the column `report_id` on the `IftaPDFGenerationLog` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `IftaReportPDF` table. All the data in the column will be lost.
  - You are about to drop the column `taxOwed` on the `IftaTaxCalculation` table. All the data in the column will be lost.
  - You are about to drop the column `taxPaid` on the `IftaTaxCalculation` table. All the data in the column will be lost.
  - You are about to drop the `IftaAuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JurisdictionTaxRate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `report_type` to the `IftaPDFGenerationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `IftaPDFGenerationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_name` to the `IftaReportPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `IftaReportPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size` to the `IftaReportPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generated_by` to the `IftaReportPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `IftaReportPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `IftaReportPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_type` to the `IftaReportPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calculated_by` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fuel_consumed` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fuel_purchased` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `net_tax_due` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_credits` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_due` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_paid` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_rate` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxable_miles` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_miles` to the `IftaTaxCalculation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IftaPDFGenerationLog" DROP COLUMN "log",
DROP COLUMN "report_id",
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "file_name" TEXT,
ADD COLUMN     "file_path" TEXT,
ADD COLUMN     "file_size" INTEGER,
ADD COLUMN     "parameters" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "report_type" TEXT NOT NULL,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IftaReportPDF" DROP COLUMN "file_url",
ADD COLUMN     "download_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "file_size" INTEGER NOT NULL,
ADD COLUMN     "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "generated_by" TEXT NOT NULL,
ADD COLUMN     "is_official" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_download" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "quarter" TEXT,
ADD COLUMN     "report_type" TEXT NOT NULL,
ADD COLUMN     "watermark" TEXT,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "IftaTaxCalculation" DROP COLUMN "taxOwed",
DROP COLUMN "taxPaid",
ADD COLUMN     "adjustments" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "calculated_by" TEXT NOT NULL,
ADD COLUMN     "fuel_consumed" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "fuel_purchased" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "is_validated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "net_tax_due" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "tax_credits" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax_due" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax_paid" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax_rate" DECIMAL(10,4) NOT NULL,
ADD COLUMN     "taxable_miles" INTEGER NOT NULL,
ADD COLUMN     "total_miles" INTEGER NOT NULL,
ADD COLUMN     "validated_at" TIMESTAMP(3),
ADD COLUMN     "validated_by" TEXT;

-- DropTable
DROP TABLE "IftaAuditLog";

-- DropTable
DROP TABLE "JurisdictionTaxRate";

-- AddForeignKey
ALTER TABLE "IftaPDFGenerationLog" ADD CONSTRAINT "IftaPDFGenerationLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IftaReportPDF" ADD CONSTRAINT "IftaReportPDF_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IftaTaxCalculation" ADD CONSTRAINT "IftaTaxCalculation_calculated_by_fkey" FOREIGN KEY ("calculated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IftaTaxCalculation" ADD CONSTRAINT "IftaTaxCalculation_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
