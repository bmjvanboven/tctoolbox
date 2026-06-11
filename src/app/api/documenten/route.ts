import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const docs = await prisma.document.findMany({
    where: { gearchiveerd: false },
    orderBy: [{ categorie: "asc" }, { naam: "asc" }],
    include: { uploadDoor: { select: { name: true } } },
  });

  // Filter op toegang
  const gefilterd = docs.filter(d => {
    if (d.toegang === "IEDEREEN") return true;
    if (d.toegang === "ADMIN") return session.user.role === "ADMIN";
    if (d.toegang.startsWith("ROL:")) return session.user.role === d.toegang.replace("ROL:", "");
    return false;
  });

  return NextResponse.json(gefilterd);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { naam, beschrijving, categorie, url, mimetype, grootte, toegang } = await req.json();
  if (!naam?.trim() || !url || !categorie) {
    return NextResponse.json({ error: "Naam, categorie en URL zijn verplicht." }, { status: 400 });
  }

  const doc = await prisma.document.create({
    data: {
      naam: naam.trim(),
      beschrijving: beschrijving?.trim() || null,
      categorie,
      url,
      mimetype: mimetype || "application/octet-stream",
      grootte: grootte || 0,
      toegang: toegang || "IEDEREEN",
      uploadDoorId: session.user.id,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
