-- CreateTable
CREATE TABLE "WachtwoordResetToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verlooptOp" TIMESTAMP(3) NOT NULL,
    "gebruiktOp" TIMESTAMP(3),
    "aangemaakt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WachtwoordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WachtwoordResetToken_tokenHash_key" ON "WachtwoordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "WachtwoordResetToken_userId_idx" ON "WachtwoordResetToken"("userId");

-- AddForeignKey
ALTER TABLE "WachtwoordResetToken" ADD CONSTRAINT "WachtwoordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
