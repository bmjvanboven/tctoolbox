-- CreateTable
CREATE TABLE "Taak" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "beschrijving" TEXT,
    "type" TEXT NOT NULL DEFAULT 'overig',
    "prioriteit" TEXT NOT NULL DEFAULT 'normaal',
    "aangemaakt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aangemaaktDoorId" TEXT NOT NULL,
    "toegewezenAanId" TEXT,
    "locatie" TEXT,
    "afgerond" BOOLEAN NOT NULL DEFAULT false,
    "afgerondOp" TIMESTAMP(3),
    "afgerondDoorId" TEXT,
    "verloopdatum" TIMESTAMP(3),

    CONSTRAINT "Taak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notitie" (
    "id" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'persoonlijk',
    "locatie" TEXT,
    "eigenaarId" TEXT NOT NULL,
    "aangemaakt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bijgewerkt" TIMESTAMP(3) NOT NULL,
    "gearchiveerd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notitie_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Taak" ADD CONSTRAINT "Taak_aangemaaktDoorId_fkey" FOREIGN KEY ("aangemaaktDoorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taak" ADD CONSTRAINT "Taak_toegewezenAanId_fkey" FOREIGN KEY ("toegewezenAanId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taak" ADD CONSTRAINT "Taak_afgerondDoorId_fkey" FOREIGN KEY ("afgerondDoorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notitie" ADD CONSTRAINT "Notitie_eigenaarId_fkey" FOREIGN KEY ("eigenaarId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
