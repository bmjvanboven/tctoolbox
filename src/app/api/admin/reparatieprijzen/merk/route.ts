import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requirePrijsbeheer() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REPARATIESPECIALIST"))
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  return null;
}

function slugify(tekst: string) {
  return tekst
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const { label } = await req.json();
  if (!label?.trim()) {
    return NextResponse.json({ error: "Vul een naam in." }, { status: 400 });
  }

  const basisKey = slugify(label) || "merk";
  let key = basisKey;
  let volgnummer = 2;
  while (await prisma.reparatieMerk.findUnique({ where: { key } })) {
    key = `${basisKey}-${volgnummer++}`;
  }

  const laatste = await prisma.reparatieMerk.findFirst({ orderBy: { volgorde: "desc" } });

  const merk = await prisma.reparatieMerk.create({
    data: { key, label: label.trim(), volgorde: (laatste?.volgorde ?? -1) + 1 },
    include: { modellen: { include: { items: true } } },
  });
  return NextResponse.json(merk, { status: 201 });
}
