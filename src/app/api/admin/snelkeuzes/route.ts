import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const groepen = await prisma.snelkeuzeGroep.findMany({
    orderBy: { volgorde: "asc" },
    include: { nummers: { orderBy: { volgorde: "asc" } } },
  });
  return NextResponse.json(groepen);
}

// Groep aanmaken
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { code, naam } = await req.json();
  const volgorde = await prisma.snelkeuzeGroep.count();
  const groep = await prisma.snelkeuzeGroep.create({ data: { code: Number(code), naam, volgorde } });
  return NextResponse.json(groep, { status: 201 });
}

// Groep bijwerken
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, code, naam } = await req.json();
  const groep = await prisma.snelkeuzeGroep.update({
    where: { id: Number(id) },
    data: { code: Number(code), naam },
  });
  return NextResponse.json(groep);
}

// Groep verwijderen
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  await prisma.snelkeuzeGroep.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
