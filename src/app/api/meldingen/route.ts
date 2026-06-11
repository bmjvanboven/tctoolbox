import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stuurPushNaarGebruiker, stuurPushNaarAllen } from "@/lib/push";

// Haal meldingen op voor de ingelogde gebruiker
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { id: userId, role } = session.user;

  const meldingen = await prisma.melding.findMany({
    where: {
      OR: [
        { doel: "IEDEREEN" },
        { doel: "ROL", doelRol: role },
        { doel: "GEBRUIKER", doelId: userId },
      ],
    },
    orderBy: { aangemaakt: "desc" },
    include: {
      van: { select: { name: true } },
      gelezen: { where: { userId }, select: { id: true } },
    },
    take: 50,
  });

  return NextResponse.json(meldingen.map(m => ({
    id: m.id,
    titel: m.titel,
    tekst: m.tekst,
    type: m.type,
    van: m.van.name,
    doel: m.doel,
    doelRol: m.doelRol,
    aangemaakt: m.aangemaakt,
    gelezen: m.gelezen.length > 0,
  })));
}

// Nieuwe melding aanmaken (iedereen mag)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { titel, tekst, type, doel, doelRol, doelId } = await req.json();

  if (!titel?.trim() || !tekst?.trim()) {
    return NextResponse.json({ error: "Titel en tekst zijn verplicht." }, { status: 400 });
  }

  const melding = await prisma.melding.create({
    data: {
      titel: titel.trim(),
      tekst: tekst.trim(),
      type: type || "info",
      vanId: session.user.id,
      doel: doel || "IEDEREEN",
      doelRol: doelRol || null,
      doelId: doelId || null,
    },
  });

  // Push notificatie sturen
  const pushPayload = { titel: titel.trim(), tekst: tekst.trim(), url: "/meldingen" };
  try {
    if (!doel || doel === "IEDEREEN") {
      stuurPushNaarAllen(pushPayload).catch(() => {});
    } else if (doel === "GEBRUIKER" && doelId) {
      stuurPushNaarGebruiker(doelId, pushPayload).catch(() => {});
    } else if (doel === "ROL" && doelRol) {
      const gebruikers = await prisma.user.findMany({ where: { role: doelRol }, select: { id: true } });
      gebruikers.forEach(g => stuurPushNaarGebruiker(g.id, pushPayload).catch(() => {}));
    }
  } catch { /* push faalt stil */ }

  return NextResponse.json(melding, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Geen ID." }, { status: 400 });
  await prisma.melding.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
