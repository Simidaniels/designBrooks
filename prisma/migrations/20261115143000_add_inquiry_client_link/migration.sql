-- Add the Inquiry -> Client association for automatic client creation on conversion.
-- Additive only — preserves all existing client and inquiry records.

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "clientId" TEXT;

-- CreateIndex
CREATE INDEX "Inquiry_clientId_idx" ON "Inquiry"("clientId");

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
