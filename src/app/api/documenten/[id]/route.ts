import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });

  // Verwijder uit Vercel Blob
  try { await del(doc.url); } catch { /**/ }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await params;
  const { naam, beschrijving, categorie, toegang } = await req.json();

  const doc = await prisma.document.update({
    where: { id },
    data: {
      naam: naam?.trim(),
      beschrijving: beschrijving?.trim() || null,
      categorie,
      toegang,
    },
  });

  return NextResponse.json(doc);
}
