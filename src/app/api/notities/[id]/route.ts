import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const notitie = await prisma.notitie.update({
    where: { id },
    data: { tekst: body.tekst, gearchiveerd: body.gearchiveerd },
    include: { eigenaar: { select: { name: true } } },
  });
  return NextResponse.json(notitie);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { id } = await params;
  await prisma.notitie.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
