-- CreateTable
CREATE TABLE "MarketingGezien" (
    "id" SERIAL NOT NULL,
    "materiaalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "op" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingGezien_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingGezien_materiaalId_userId_key" ON "MarketingGezien"("materiaalId", "userId");

-- AddForeignKey
ALTER TABLE "MarketingGezien" ADD CONSTRAINT "MarketingGezien_materiaalId_fkey" FOREIGN KEY ("materiaalId") REFERENCES "MarketingMateriaal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingGezien" ADD CONSTRAINT "MarketingGezien_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
