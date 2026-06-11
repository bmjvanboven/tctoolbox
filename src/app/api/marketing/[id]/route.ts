import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await params;
  await prisma.marketingMateriaal.update({
    where: { id },
    data: { gearchiveerd: true },
  });

  return NextResponse.json({ ok: true });
}
