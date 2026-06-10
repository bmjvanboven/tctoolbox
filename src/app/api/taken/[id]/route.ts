import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Afvinken / terugzetten
  if ("afgerond" in body) {
    const taak = await prisma.taak.update({
      where: { id },
      data: {
        afgerond: body.afgerond,
        afgerondOp: body.afgerond ? new Date() : null,
        afgerondDoorId: body.afgerond ? session.user.id : null,
      },
      include: {
        aangemaaaktDoor: { select: { id: true, name: true } },
        toegewezenAan: { select: { id: true, name: true } },
        afgerondDoor: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(taak);
  }

  // Bewerken (alleen aanmaker of admin)
  const bestaand = await prisma.taak.findUnique({ where: { id } });
  if (!bestaand) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  if (session.user.role !== "ADMIN" && bestaand.aangemaaktDoorId !== session.user.id) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const taak = await prisma.taak.update({
    where: { id },
    data: {
      titel: body.titel?.trim() || bestaand.titel,
      beschrijving: body.beschrijving?.trim() ?? bestaand.beschrijving,
      type: body.type || bestaand.type,
      prioriteit: body.prioriteit || bestaand.prioriteit,
      toegewezenAanId: "toegewezenAanId" in body ? body.toegewezenAanId : bestaand.toegewezenAanId,
      locatie: "locatie" in body ? body.locatie : bestaand.locatie,
      verloopdatum: "verloopdatum" in body ? (body.verloopdatum ? new Date(body.verloopdatum) : null) : bestaand.verloopdatum,
    },
    include: {
      aangemaaaktDoor: { select: { id: true, name: true } },
      toegewezenAan: { select: { id: true, name: true } },
      afgerondDoor: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(taak);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { id } = await params;
  const bestaand = await prisma.taak.findUnique({ where: { id } });
  if (!bestaand) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });

  if (session.user.role !== "ADMIN" && bestaand.aangemaaktDoorId !== session.user.id) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  await prisma.taak.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
