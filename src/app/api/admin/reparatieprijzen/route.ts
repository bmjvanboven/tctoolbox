import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requirePrijsbeheer() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REPARATIESPECIALIST"))
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  return null;
}

export async function POST(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const { modelId, cat, naam, prijs } = await req.json();
  if (!modelId || !cat || !naam || prijs === undefined) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const item = await prisma.reparatieItem.create({
    data: { modelId: Number(modelId), cat, naam, prijs: Number(prijs) },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const { id, prijs, naam } = await req.json();
  const data: Record<string, unknown> = {};
  if (prijs !== undefined) data.prijs = Number(prijs);
  if (naam !== undefined) data.naam = naam;

  const item = await prisma.reparatieItem.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  await prisma.reparatieItem.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
