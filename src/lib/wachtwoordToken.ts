import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function maakWachtwoordToken(userId: string, geldigheidMinuten: number) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.wachtwoordResetToken.create({
    data: {
      userId,
      tokenHash,
      verlooptOp: new Date(Date.now() + geldigheidMinuten * 60 * 1000),
    },
  });

  return rawToken;
}
