import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { huidigeDatumKey, puzzelVoorDatum, isGokJuist, MAX_POGINGEN } from "@/lib/pinpoint";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const gok = typeof body?.gok === "string" ? body.gok.trim() : "";
  if (!gok) return NextResponse.json({ error: "Gok ontbreekt." }, { status: 400 });

  const datum = huidigeDatumKey();
  const puzzel = puzzelVoorDatum(datum);
  const userId = session.user.id;

  const bestaand = await prisma.pinpointPoging.findUnique({
    where: { datum_userId: { datum, userId } },
  });

  if (bestaand?.afgerond) {
    return NextResponse.json({ error: "Je hebt vandaag al gespeeld." }, { status: 409 });
  }

  const woordenGetoond = bestaand?.woordenGetoond ?? 1;
  const gokken = [...(bestaand?.gokken ?? []), gok];
  const juist = isGokJuist(puzzel, gok);

  let nieuweWoordenGetoond = woordenGetoond;
  let afgerond = false;
  let opgelost = false;
  let aantalWoorden: number | null = null;

  if (juist) {
    afgerond = true;
    opgelost = true;
    aantalWoorden = woordenGetoond;
  } else if (woordenGetoond < MAX_POGINGEN) {
    nieuweWoordenGetoond = woordenGetoond + 1;
  } else {
    afgerond = true;
    opgelost = false;
  }

  const data = {
    datum,
    userId,
    gokken,
    woordenGetoond: nieuweWoordenGetoond,
    afgerond,
    opgelost,
    aantalWoorden,
  };

  await prisma.pinpointPoging.upsert({
    where: { datum_userId: { datum, userId } },
    create: data,
    update: data,
  });

  return NextResponse.json({
    juist,
    afgerond,
    opgelost,
    aantalWoorden,
    woordenGetoond: nieuweWoordenGetoond,
    woorden: puzzel.woorden.slice(0, nieuweWoordenGetoond),
    onderwerp: afgerond ? puzzel.onderwerp : undefined,
  });
}
