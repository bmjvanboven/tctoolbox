-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "beschrijving" TEXT,
    "categorie" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "grootte" INTEGER NOT NULL,
    "toegang" TEXT NOT NULL DEFAULT 'IEDEREEN',
    "uploadDoorId" TEXT NOT NULL,
    "aangemaakt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bijgewerkt" TIMESTAMP(3) NOT NULL,
    "gearchiveerd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadDoorId_fkey" FOREIGN KEY ("uploadDoorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
