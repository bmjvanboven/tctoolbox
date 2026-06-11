import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const materialen = await prisma.marketingMateriaal.findMany({
    where: { gearchiveerd: false },
    select: { id: true },
  });

  await prisma.marketingGezien.createMany({
    data: materialen.map(m => ({ materiaalId: m.id, userId: session.user.id })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true });
}
