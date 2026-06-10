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

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { groepId, code, naam } = await req.json();
  const volgorde = await prisma.snelkeuzeNummer.count({ where: { groepId: Number(groepId) } });
  const nummer = await prisma.snelkeuzeNummer.create({
    data: { groepId: Number(groepId), code: Number(code), naam, volgorde },
  });
  return NextResponse.json(nummer, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, code, naam } = await req.json();
  const nummer = await prisma.snelkeuzeNummer.update({
    where: { id: Number(id) },
    data: { code: Number(code), naam },
  });
  return NextResponse.json(nummer);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  await prisma.snelkeuzeNummer.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
