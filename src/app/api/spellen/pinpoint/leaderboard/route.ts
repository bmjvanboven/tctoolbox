import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { huidigeDatumKey } from "@/lib/pinpoint";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const datum = huidigeDatumKey();

  const pogingen = await prisma.pinpointPoging.findMany({
    where: { datum, opgelost: true },
    orderBy: [{ aantalWoorden: "asc" }, { bijgewerkt: "asc" }],
    take: 10,
    select: {
      userId: true,
      aantalWoorden: true,
      bijgewerkt: true,
      user: { select: { voornaam: true, locatie: true } },
    },
  });

  return NextResponse.json({
    leaderboard: pogingen.map(p => ({
      naam: p.user.voornaam || "Onbekend",
      locatie: p.user.locatie,
      aantalWoorden: p.aantalWoorden,
      jij: p.userId === session.user.id,
    })),
  });
}
