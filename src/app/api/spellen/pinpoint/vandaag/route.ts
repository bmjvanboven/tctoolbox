import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { huidigeDatumKey, puzzelVoorDatum } from "@/lib/pinpoint";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const datum = huidigeDatumKey();
  const puzzel = puzzelVoorDatum(datum);

  const poging = await prisma.pinpointPoging.findUnique({
    where: { datum_userId: { datum, userId: session.user.id } },
  });

  if (!poging) {
    return NextResponse.json({
      gespeeld: false,
      afgerond: false,
      opgelost: false,
      woordenGetoond: 1,
      woorden: [puzzel.woorden[0]],
      gokken: [],
    });
  }

  return NextResponse.json({
    gespeeld: true,
    afgerond: poging.afgerond,
    opgelost: poging.opgelost,
    aantalWoorden: poging.aantalWoorden,
    woordenGetoond: poging.woordenGetoond,
    woorden: puzzel.woorden.slice(0, poging.woordenGetoond),
    gokken: poging.gokken,
    onderwerp: poging.afgerond ? puzzel.onderwerp : undefined,
  });
}
