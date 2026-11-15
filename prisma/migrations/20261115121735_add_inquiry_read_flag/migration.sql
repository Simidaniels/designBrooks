-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Inquiry_isRead_status_idx" ON "Inquiry"("isRead", "status");
