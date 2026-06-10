import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { id: userId, role } = session.user;

  // Iedereen ziet: eigen taken + taken voor zijn locatie + alle taken als admin
  const taken = await prisma.taak.findMany({
    where: role === "ADMIN"
      ? {}
      : { OR: [{ toegewezenAanId: userId }, { aangemaaktDoorId: userId }] },
    orderBy: [{ afgerond: "asc" }, { prioriteit: "asc" }, { aangemaakt: "desc" }],
    include: {
      aangemaaaktDoor: { select: { id: true, name: true } },
      toegewezenAan: { select: { id: true, name: true } },
      afgerondDoor: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(taken);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { titel, beschrijving, type, prioriteit, toegewezenAanId, locatie, verloopdatum } = await req.json();

  if (!titel?.trim()) return NextResponse.json({ error: "Titel is verplicht." }, { status: 400 });

  const taak = await prisma.taak.create({
    data: {
      titel: titel.trim(),
      beschrijving: beschrijving?.trim() || null,
      type: type || "overig",
      prioriteit: prioriteit || "normaal",
      aangemaaktDoorId: session.user.id,
      toegewezenAanId: toegewezenAanId || null,
      locatie: locatie || null,
      verloopdatum: verloopdatum ? new Date(verloopdatum) : null,
    },
    include: {
      aangemaaaktDoor: { select: { id: true, name: true } },
      toegewezenAan: { select: { id: true, name: true } },
      afgerondDoor: { select: { id: true, name: true } },
    },
  });

  // Stuur melding naar de toegewezen persoon (als dat niet jezelf is)
  if (toegewezenAanId && toegewezenAanId !== session.user.id) {
    const typeLabels: Record<string, string> = {
      bellen: "Klant bellen", whatsapp: "WhatsApp sturen",
      opvolgen: "Opvolgactie", afvinken: "Afvinken / controle", overig: "Taak",
    };
    await prisma.melding.create({
      data: {
        titel: `✅ Nieuwe taak van ${session.user.name}`,
        tekst: `${typeLabels[type] ?? "Taak"}: ${titel.trim()}${beschrijving ? `\n${beschrijving.trim()}` : ""}`,
        type: "actie",
        vanId: session.user.id,
        doel: "GEBRUIKER",
        doelId: toegewezenAanId,
      },
    });
  }

  return NextResponse.json(taak, { status: 201 });
}
