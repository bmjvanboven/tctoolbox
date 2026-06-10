import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ count: 0 });

  const count = await prisma.taak.count({
    where: {
      afgerond: false,
      OR: [
        { toegewezenAanId: session.user.id },
        { aangemaaktDoorId: session.user.id },
      ],
    },
  });

  return NextResponse.json({ count });
}
