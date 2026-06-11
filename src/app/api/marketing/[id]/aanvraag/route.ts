import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { id: materiaalId } = await params;
  const { filiaal, opmerking } = await req.json();

  if (!filiaal?.trim()) return NextResponse.json({ error: "Filiaal is verplicht." }, { status: 400 });

  const materiaal = await prisma.marketingMateriaal.findUnique({ where: { id: materiaalId } });
  if (!materiaal) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });

  const aanvraag = await prisma.marketingAanvraag.upsert({
    where: { materiaalId_aanvragerId: { materiaalId, aanvragerId: session.user.id } },
    update: { filiaal: filiaal.trim(), opmerking: opmerking?.trim() || null, status: "aangevraagd", bijgewerkt: new Date() },
    create: {
      materiaalId,
      aanvragerId: session.user.id,
      filiaal: filiaal.trim(),
      opmerking: opmerking?.trim() || null,
    },
  });

  // Melding naar alle admins
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", active: true } });
  await prisma.melding.createMany({
    data: admins.map(admin => ({
      titel: `Marketingaanvraag: ${materiaal.titel}`,
      tekst: `${session.user.name} (${filiaal}) heeft "${materiaal.titel}" aangevraagd.${opmerking ? ` Opmerking: ${opmerking}` : ""}`,
      type: "info",
      vanId: session.user.id,
      doel: "GEBRUIKER" as const,
      doelId: admin.id,
    })),
  });

  return NextResponse.json(aanvraag);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id: materiaalId } = await params;
  const { aanvraagId, status } = await req.json();

  const aanvraag = await prisma.marketingAanvraag.update({
    where: { id: aanvraagId, materiaalId },
    data: { status },
  });

  return NextResponse.json(aanvraag);
}
