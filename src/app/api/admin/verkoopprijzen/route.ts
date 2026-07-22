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

  const { modelId, gb, grade, prijs, innamePrijs } = await req.json();
  if (!modelId || !gb || !grade || prijs === undefined) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const item = await prisma.verkoopPrijs.create({
    data: {
      modelId: Number(modelId),
      gb: Number(gb),
      grade,
      prijs: Number(prijs),
      innamePrijs: innamePrijs !== undefined && innamePrijs !== "" ? Number(innamePrijs) : null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const { id, prijs, innamePrijs } = await req.json();
  const data: Record<string, unknown> = {};
  if (prijs !== undefined) data.prijs = Number(prijs);
  if (innamePrijs !== undefined) data.innamePrijs = innamePrijs === null || innamePrijs === "" ? null : Number(innamePrijs);

  const item = await prisma.verkoopPrijs.update({
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

  await prisma.verkoopPrijs.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
