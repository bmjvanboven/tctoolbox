import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { voornaam, achternaam, name, email, password, role, active } = await req.json();

  if (!voornaam || !email || !password || !role) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const bestaat = await prisma.user.findUnique({ where: { email } });
  if (bestaat) {
    return NextResponse.json({ error: "E-mailadres is al in gebruik." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { voornaam, achternaam: achternaam ?? "", name: name || voornaam, email, password: hashed, role, active: active ?? true },
  });

  return NextResponse.json(user, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, voornaam, achternaam, name, email, password, role, active } = await req.json();

  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  const data: Record<string, unknown> = { voornaam, achternaam, name, email, role, active };
  if (password) data.password = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
