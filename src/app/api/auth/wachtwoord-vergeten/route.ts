import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verstuurWachtwoordResetMail } from "@/lib/email";
import crypto from "crypto";

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

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    return generiekAntwoord();
  }

  const recent = await prisma.wachtwoordResetToken.findFirst({
    where: { userId: user.id, aangemaakt: { gt: new Date(Date.now() - 60 * 1000) } },
  });
  if (recent) {
    return generiekAntwoord();
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.wachtwoordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      verlooptOp: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetUrl = `${req.nextUrl.origin}/wachtwoord-resetten?token=${rawToken}`;

  try {
    await verstuurWachtwoordResetMail(user.email, resetUrl);
  } catch (err) {
    console.error("Versturen wachtwoord-reset e-mail mislukt:", err);
    return NextResponse.json({ error: "Versturen van de e-mail is mislukt. Probeer het later opnieuw." }, { status: 500 });
  }

  return generiekAntwoord();
}
