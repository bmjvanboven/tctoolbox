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

  const { merkId, label, groep } = await req.json();
  if (!merkId || !label) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const basisKey = slugify(label) || "toestel";
  let modelKey = basisKey;
  let volgnummer = 2;
  while (
    await prisma.reparatieModel.findUnique({
      where: { merkId_modelKey: { merkId: Number(merkId), modelKey } },
    })
  ) {
    modelKey = `${basisKey}-${volgnummer++}`;
  }

  const laatste = await prisma.reparatieModel.findFirst({
    where: { merkId: Number(merkId) },
    orderBy: { volgorde: "desc" },
  });

  const model = await prisma.reparatieModel.create({
    data: {
      merkId: Number(merkId),
      modelKey,
      label,
      groep: groep || null,
      volgorde: (laatste?.volgorde ?? -1) + 1,
    },
    include: { items: true },
  });
  return NextResponse.json(model, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const { id, label } = await req.json();
  if (!id || !label) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const model = await prisma.reparatieModel.update({
    where: { id: Number(id) },
    data: { label },
  });
  return NextResponse.json(model);
}

export async function DELETE(req: NextRequest) {
  const denied = await requirePrijsbeheer();
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  await prisma.reparatieModel.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
