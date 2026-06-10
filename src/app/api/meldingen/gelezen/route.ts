import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { meldingId } = await req.json();

  await prisma.meldingGelezen.upsert({
    where: { meldingId_userId: { meldingId, userId: session.user.id } },
    update: {},
    create: { meldingId, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

// Markeer alle als gelezen
export async function PUT() {
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
      gelezen: { none: { userId } },
    },
    select: { id: true },
  });

  await prisma.meldingGelezen.createMany({
    data: meldingen.map(m => ({ meldingId: m.id, userId })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true });
}
