import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const locatie = req.nextUrl.searchParams.get("locatie");
  const type = req.nextUrl.searchParams.get("type") || "persoonlijk";

  let notities;

  if (type === "vestiging") {
    notities = await prisma.notitie.findMany({
      where: { type: "vestiging", locatie: locatie || undefined, gearchiveerd: false },
      orderBy: { bijgewerkt: "desc" },
      include: { eigenaar: { select: { name: true } }, toegewezenAan: { select: { name: true } } },
    });
  } else if (type === "toegewezen") {
    // Notities die aan mij zijn toegewezen
    notities = await prisma.notitie.findMany({
      where: { toegewezenAanId: session.user.id, gearchiveerd: false },
      orderBy: { bijgewerkt: "desc" },
      include: { eigenaar: { select: { name: true } }, toegewezenAan: { select: { name: true } } },
    });
  } else {
    // Persoonlijk: eigen notities + die ik heb aangemaakt en toegewezen
    notities = await prisma.notitie.findMany({
      where: {
        type: "persoonlijk",
        OR: [
          { eigenaarId: session.user.id },
        ],
        gearchiveerd: false,
      },
      orderBy: { bijgewerkt: "desc" },
      include: { eigenaar: { select: { name: true } }, toegewezenAan: { select: { name: true } } },
    });
  }

  return NextResponse.json(notities);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { tekst, type, locatie, toegewezenAanId } = await req.json();
  if (!tekst?.trim()) return NextResponse.json({ error: "Tekst is verplicht." }, { status: 400 });

  const notitie = await prisma.notitie.create({
    data: {
      tekst: tekst.trim(),
      type: toegewezenAanId ? "persoonlijk" : (type || "persoonlijk"),
      locatie: type === "vestiging" ? (locatie || null) : null,
      eigenaarId: session.user.id,
      toegewezenAanId: toegewezenAanId || null,
    },
    include: {
      eigenaar: { select: { name: true } },
      toegewezenAan: { select: { name: true } },
    },
  });

  // Stuur automatisch een melding als de notitie is toegewezen aan iemand anders
  if (toegewezenAanId && toegewezenAanId !== session.user.id) {
    await prisma.melding.create({
      data: {
        titel: `📝 Nieuwe notitie van ${session.user.name}`,
        tekst: tekst.trim().slice(0, 200),
        type: "notitie",
        vanId: session.user.id,
        doel: "GEBRUIKER",
        doelId: toegewezenAanId,
      },
    });
  }

  return NextResponse.json(notitie, { status: 201 });
}
