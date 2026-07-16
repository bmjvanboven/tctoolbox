import { prisma } from "@/lib/db";

export async function logAudit(params: {
  actie: string;
  userId?: string | null;
  email?: string | null;
  ip?: string | null;
  detail?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actie: params.actie,
        userId: params.userId ?? null,
        email: params.email ?? null,
        ip: params.ip ?? null,
        detail: params.detail,
      },
    });
  } catch (err) {
    console.error("Wegschrijven van audit log mislukt:", err);
  }
}

export function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}
