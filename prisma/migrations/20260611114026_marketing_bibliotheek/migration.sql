-- CreateTable
CREATE TABLE "MarketingMateriaal" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "beschrijving" TEXT,
    "categorie" TEXT NOT NULL DEFAULT 'Overig',
    "afbeeldingUrls" TEXT[],
    "filiaalBasis" TEXT,
    "aangemaakt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bijgewerkt" TIMESTAMP(3) NOT NULL,
    "gearchiveerd" BOOLEAN NOT NULL DEFAULT false,
    "aangemaaktDoorId" TEXT NOT NULL,

    CONSTRAINT "MarketingMateriaal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingAanvraag" (
    "id" TEXT NOT NULL,
    "materiaalId" TEXT NOT NULL,
    "aanvragerId" TEXT NOT NULL,
    "filiaal" TEXT NOT NULL,
    "opmerking" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aangevraagd',
    "aangemaakt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bijgewerkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingAanvraag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingAanvraag_materiaalId_aanvragerId_key" ON "MarketingAanvraag"("materiaalId", "aanvragerId");

-- AddForeignKey
ALTER TABLE "MarketingMateriaal" ADD CONSTRAINT "MarketingMateriaal_aangemaaktDoorId_fkey" FOREIGN KEY ("aangemaaktDoorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingAanvraag" ADD CONSTRAINT "MarketingAanvraag_materiaalId_fkey" FOREIGN KEY ("materiaalId") REFERENCES "MarketingMateriaal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingAanvraag" ADD CONSTRAINT "MarketingAanvraag_aanvragerId_fkey" FOREIGN KEY ("aanvragerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
