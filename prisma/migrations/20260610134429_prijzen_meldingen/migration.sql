-- CreateEnum
CREATE TYPE "MeldingDoel" AS ENUM ('IEDEREEN', 'ROL', 'GEBRUIKER');

-- CreateTable
CREATE TABLE "ReparatieMerk" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "volgorde" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReparatieMerk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReparatieModel" (
    "id" SERIAL NOT NULL,
    "modelKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "groep" TEXT,
    "volgorde" INTEGER NOT NULL DEFAULT 0,
    "merkId" INTEGER NOT NULL,

    CONSTRAINT "ReparatieModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReparatieItem" (
    "id" SERIAL NOT NULL,
    "cat" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "prijs" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,

    CONSTRAINT "ReparatieItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerkoopModel" (
    "id" SERIAL NOT NULL,
    "naam" TEXT NOT NULL,
    "volgorde" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VerkoopModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerkoopPrijs" (
    "id" SERIAL NOT NULL,
    "gb" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "prijs" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,

    CONSTRAINT "VerkoopPrijs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Melding" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "vanId" TEXT NOT NULL,
    "doel" "MeldingDoel" NOT NULL DEFAULT 'IEDEREEN',
    "doelRol" "Role",
    "doelId" TEXT,
    "aangemaakt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Melding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeldingGelezen" (
    "id" SERIAL NOT NULL,
    "meldingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "op" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeldingGelezen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReparatieMerk_key_key" ON "ReparatieMerk"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ReparatieModel_merkId_modelKey_key" ON "ReparatieModel"("merkId", "modelKey");

-- CreateIndex
CREATE UNIQUE INDEX "VerkoopModel_naam_key" ON "VerkoopModel"("naam");

-- CreateIndex
CREATE UNIQUE INDEX "VerkoopPrijs_modelId_gb_grade_key" ON "VerkoopPrijs"("modelId", "gb", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "MeldingGelezen_meldingId_userId_key" ON "MeldingGelezen"("meldingId", "userId");

-- AddForeignKey
ALTER TABLE "ReparatieModel" ADD CONSTRAINT "ReparatieModel_merkId_fkey" FOREIGN KEY ("merkId") REFERENCES "ReparatieMerk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReparatieItem" ADD CONSTRAINT "ReparatieItem_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ReparatieModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerkoopPrijs" ADD CONSTRAINT "VerkoopPrijs_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VerkoopModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Melding" ADD CONSTRAINT "Melding_vanId_fkey" FOREIGN KEY ("vanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeldingGelezen" ADD CONSTRAINT "MeldingGelezen_meldingId_fkey" FOREIGN KEY ("meldingId") REFERENCES "Melding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeldingGelezen" ADD CONSTRAINT "MeldingGelezen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
