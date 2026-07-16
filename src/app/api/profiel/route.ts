import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { valideerWachtwoord } from "@/lib/wachtwoord";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const { voornaam, achternaam, huidigWachtwoord, nieuwWachtwoord } = await req.json();

  if (!voornaam?.trim()) {
    return NextResponse.json({ error: "Voornaam is verplicht." }, { status: 400 });
  }

  const name = `${voornaam.trim()} ${(achternaam ?? "").trim()}`.trim();
  const data: Record<string, unknown> = { voornaam, achternaam: achternaam ?? "", name };

  if (nieuwWachtwoord) {
    if (!huidigWachtwoord) {
      return NextResponse.json({ error: "Vul je huidige wachtwoord in." }, { status: 400 });
    }
    const fout = valideerWachtwoord(nieuwWachtwoord);
    if (fout) {
      return NextResponse.json({ error: fout }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const klopt = user && await bcrypt.compare(huidigWachtwoord, user.password);
    if (!klopt) {
      return NextResponse.json({ error: "Huidig wachtwoord is onjuist." }, { status: 400 });
    }
    data.password = await bcrypt.hash(nieuwWachtwoord, 12);
  }

  const user = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ name: user.name });
}
