import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const WINKELS = ["Gemert", "Deurne", "Asten", "Geldrop", "Veghel"];

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { locatie: true },
  });

  return NextResponse.json({ locatie: user?.locatie ?? null });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { locatie } = await req.json();

  if (!WINKELS.includes(locatie)) {
    return NextResponse.json({ error: "Ongeldige locatie." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { locatie },
  });

  return NextResponse.json({ ok: true });
}
