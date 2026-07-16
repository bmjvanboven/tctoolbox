-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mislukteInlogpogingen" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inlogGeblokkeerdTot" TIMESTAMP(3),
ADD COLUMN     "wachtwoordGewijzigdOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
