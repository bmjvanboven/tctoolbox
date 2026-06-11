import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ count: 0 });

  const totaal = await prisma.marketingMateriaal.count({ where: { gearchiveerd: false } });
  const gezien = await prisma.marketingGezien.count({ where: { userId: session.user.id } });

  return NextResponse.json({ count: Math.max(0, totaal - gezien) });
}
