import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const materialen = await prisma.marketingMateriaal.findMany({
    where: { gearchiveerd: false },
    orderBy: { aangemaakt: "desc" },
    include: {
      aangemaaktDoor: { select: { id: true, name: true } },
      aanvragen: {
        select: { id: true, aanvragerId: true, filiaal: true, status: true, aangemaakt: true },
      },
    },
  });

  return NextResponse.json(materialen);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { titel, beschrijving, categorie, afbeeldingUrls, filiaalBasis } = await req.json();
  if (!titel?.trim()) return NextResponse.json({ error: "Titel is verplicht." }, { status: 400 });

  const materiaal = await prisma.marketingMateriaal.create({
    data: {
      titel: titel.trim(),
      beschrijving: beschrijving?.trim() || null,
      categorie: categorie || "Overig",
      afbeeldingUrls: afbeeldingUrls || [],
      filiaalBasis: filiaalBasis?.trim() || null,
      aangemaaktDoorId: session.user.id,
    },
    include: {
      aangemaaktDoor: { select: { id: true, name: true } },
      aanvragen: true,
    },
  });

  // Verwijder gezien-records zodat badge bij iedereen opnieuw verschijnt
  await prisma.marketingGezien.deleteMany({ where: { materiaalId: materiaal.id } });

  return NextResponse.json(materiaal);
}
