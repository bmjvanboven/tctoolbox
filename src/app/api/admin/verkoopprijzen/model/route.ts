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

  const { naam } = await req.json();
  if (!naam?.trim()) {
    return NextResponse.json({ error: "Vul een naam in." }, { status: 400 });
  }

  const bestaat = await prisma.verkoopModel.findUnique({ where: { naam: naam.trim() } });
  if (bestaat) {
    return NextResponse.json({ error: "Toestel bestaat al." }, { status: 400 });
  }

  const laatste = await prisma.verkoopModel.findFirst({ orderBy: { volgorde: "desc" } });
  const model = await prisma.verkoopModel.create({
    data: { naam: naam.trim(), volgorde: (laatste?.volgorde ?? -1) + 1 },
    include: { prijzen: true },
  });
  return NextResponse.json(model, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const { id, naam, onderdelenInname } = await req.json();
  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (naam !== undefined) data.naam = naam;
  if (onderdelenInname !== undefined) {
    data.onderdelenInname = onderdelenInname === null || onderdelenInname === "" ? null : Number(onderdelenInname);
  }

  const model = await prisma.verkoopModel.update({ where: { id: Number(id) }, data });
  return NextResponse.json(model);
}

export async function DELETE(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  await prisma.verkoopModel.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
