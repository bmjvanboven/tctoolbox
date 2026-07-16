import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, getClientIp } from "@/lib/audit";
import { maakWachtwoordToken } from "@/lib/wachtwoordToken";
import { verstuurUitnodigingsMail } from "@/lib/email";

const UITNODIGING_GELDIGHEID_MINUTEN = 48 * 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  if (user.password) {
    return NextResponse.json({ error: "Deze gebruiker heeft al een wachtwoord ingesteld." }, { status: 400 });
  }

  const rawToken = await maakWachtwoordToken(user.id, UITNODIGING_GELDIGHEID_MINUTEN);
  const url = `${req.nextUrl.origin}/wachtwoord-resetten?token=${rawToken}`;

  try {
    await verstuurUitnodigingsMail(user.email, user.name, url);
  } catch (err) {
    console.error("Versturen uitnodiging mislukt:", err);
    return NextResponse.json({ error: "Versturen van de e-mail is mislukt." }, { status: 500 });
  }

  await logAudit({
    actie: "UITNODIGING_OPNIEUW_VERSTUURD",
    userId: session.user.id,
    ip: getClientIp(req),
    detail: `naar: ${user.email}`,
  });

  return NextResponse.json({ ok: true });
}
