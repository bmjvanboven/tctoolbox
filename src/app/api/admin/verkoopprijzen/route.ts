import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requirePrijsbeheer() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REPARATIESPECIALIST"))
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  return null;
}

export async function PUT(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const { id, prijs } = await req.json();
  const item = await prisma.verkoopPrijs.update({
    where: { id: Number(id) },
    data: { prijs: Number(prijs) },
  });
  return NextResponse.json(item);
}
