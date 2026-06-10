-- AlterTable
ALTER TABLE "Notitie" ADD COLUMN     "toegewezenAanId" TEXT;

-- AddForeignKey
ALTER TABLE "Notitie" ADD CONSTRAINT "Notitie_toegewezenAanId_fkey" FOREIGN KEY ("toegewezenAanId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
