import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { valideerWachtwoord } from "@/lib/wachtwoord";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { token, wachtwoord } = await req.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Ongeldige resetlink." }, { status: 400 });
  }

  const fout = valideerWachtwoord(wachtwoord ?? "");
  if (fout) {
    return NextResponse.json({ error: fout }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.wachtwoordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !resetToken ||
    resetToken.gebruiktOp ||
    resetToken.verlooptOp < new Date()
  ) {
    return NextResponse.json({ error: "Deze resetlink is ongeldig of verlopen." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(wachtwoord, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashed } }),
    prisma.wachtwoordResetToken.update({ where: { id: resetToken.id }, data: { gebruiktOp: new Date() } }),
  ]);

  return NextResponse.json({ message: "Wachtwoord is bijgewerkt." });
}
