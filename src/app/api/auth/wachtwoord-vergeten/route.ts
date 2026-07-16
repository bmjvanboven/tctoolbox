import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verstuurWachtwoordResetMail } from "@/lib/email";
import { logAudit, getClientIp } from "@/lib/audit";
import { maakWachtwoordToken } from "@/lib/wachtwoordToken";

const ACTIE = "WACHTWOORD_VERGETEN_AANGEVRAAGD";
const MAX_AANVRAGEN_PER_UUR = 5;

function generiekAntwoord() {
  return NextResponse.json({
    message: "Als dit e-mailadres bekend is, is er een resetlink verstuurd.",
  });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Vul een e-mailadres in." }, { status: 400 });
  }

  const ip = getClientIp(req);
  const eenUurGeleden = new Date(Date.now() - 60 * 60 * 1000);

  if (ip) {
    const ipAanvragen = await prisma.auditLog.count({
      where: { actie: ACTIE, ip, aangemaakt: { gt: eenUurGeleden } },
    });
    if (ipAanvragen >= MAX_AANVRAGEN_PER_UUR) {
      return NextResponse.json(
        { error: "Te veel aanvragen vanaf dit apparaat. Probeer het over een uur opnieuw." },
        { status: 429 }
      );
    }
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    await logAudit({ actie: ACTIE, email, ip, detail: "onbekend e-mailadres" });
    return generiekAntwoord();
  }

  const emailAanvragen = await prisma.auditLog.count({
    where: { actie: ACTIE, email: user.email, aangemaakt: { gt: eenUurGeleden } },
  });
  if (emailAanvragen >= MAX_AANVRAGEN_PER_UUR) {
    await logAudit({ actie: ACTIE, userId: user.id, email: user.email, ip, detail: "limiet bereikt, geen mail verstuurd" });
    return generiekAntwoord();
  }

  await logAudit({ actie: ACTIE, userId: user.id, email: user.email, ip });

  const rawToken = await maakWachtwoordToken(user.id, 30);
  const resetUrl = `${req.nextUrl.origin}/wachtwoord-resetten?token=${rawToken}`;

  try {
    await verstuurWachtwoordResetMail(user.email, resetUrl);
  } catch (err) {
    console.error("Versturen wachtwoord-reset e-mail mislukt:", err);
    return NextResponse.json({ error: "Versturen van de e-mail is mislukt. Probeer het later opnieuw." }, { status: 500 });
  }

  return generiekAntwoord();
}
