-- AlterTable
ALTER TABLE "LoadDocument" ADD COLUMN     "category" TEXT,
ADD COLUMN     "is_required" BOOLEAN DEFAULT false,
ADD COLUMN     "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
