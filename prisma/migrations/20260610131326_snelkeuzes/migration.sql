-- CreateTable
CREATE TABLE "SnelkeuzeGroep" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "naam" TEXT NOT NULL,
    "volgorde" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SnelkeuzeGroep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnelkeuzeNummer" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "naam" TEXT NOT NULL,
    "volgorde" INTEGER NOT NULL DEFAULT 0,
    "groepId" INTEGER NOT NULL,

    CONSTRAINT "SnelkeuzeNummer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SnelkeuzeGroep_code_key" ON "SnelkeuzeGroep"("code");

-- AddForeignKey
ALTER TABLE "SnelkeuzeNummer" ADD CONSTRAINT "SnelkeuzeNummer_groepId_fkey" FOREIGN KEY ("groepId") REFERENCES "SnelkeuzeGroep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
