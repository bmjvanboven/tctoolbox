-- CreateTable
CREATE TABLE "PinpointPoging" (
    "id" TEXT NOT NULL,
    "datum" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gokken" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "woordenGetoond" INTEGER NOT NULL DEFAULT 1,
    "aantalWoorden" INTEGER,
    "opgelost" BOOLEAN NOT NULL DEFAULT false,
    "afgerond" BOOLEAN NOT NULL DEFAULT false,
    "aangemaakt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bijgewerkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PinpointPoging_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PinpointPoging_datum_opgelost_aantalWoorden_idx" ON "PinpointPoging"("datum", "opgelost", "aantalWoorden");

-- CreateIndex
CREATE UNIQUE INDEX "PinpointPoging_datum_userId_key" ON "PinpointPoging"("datum", "userId");

-- AddForeignKey
ALTER TABLE "PinpointPoging" ADD CONSTRAINT "PinpointPoging_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
