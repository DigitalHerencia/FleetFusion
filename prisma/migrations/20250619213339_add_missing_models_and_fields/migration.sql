-- CreateTable
CREATE TABLE "LoadDocument" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoadDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatoryAudit" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegulatoryAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IftaPDFGenerationLog" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "log" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IftaPDFGenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IftaReportPDF" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IftaReportPDF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IftaTaxCalculation" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "taxOwed" DECIMAL(10,2) NOT NULL,
    "taxPaid" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IftaTaxCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IftaAuditLog" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "IftaAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JurisdictionTaxRate" (
    "id" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "rate" DECIMAL(10,4) NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JurisdictionTaxRate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IftaTaxCalculation" ADD CONSTRAINT "IftaTaxCalculation_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "ifta_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
