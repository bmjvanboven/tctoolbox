import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { valideerWachtwoord } from "@/lib/wachtwoord";
import { logAudit, getClientIp } from "@/lib/audit";
import { maakWachtwoordToken } from "@/lib/wachtwoordToken";
import { verstuurUitnodigingsMail } from "@/lib/email";
import bcrypt from "bcryptjs";

const UITNODIGING_GELDIGHEID_MINUTEN = 48 * 60;

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { denied: NextResponse.json({ error: "Geen toegang." }, { status: 403 }), session: null };
  }
  return { denied: null, session };
}

export async function POST(req: NextRequest) {
  const { denied, session } = await requireAdmin();
  if (denied) return denied;

  const { voornaam, achternaam, name, email, password, role, active } = await req.json();

  if (!voornaam || !email || !role) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  if (password) {
    const wwFout = valideerWachtwoord(password);
    if (wwFout) {
      return NextResponse.json({ error: wwFout }, { status: 400 });
    }
  }

  const bestaat = await prisma.user.findUnique({ where: { email } });
  if (bestaat) {
    return NextResponse.json({ error: "E-mailadres is al in gebruik." }, { status: 400 });
  }

  const volledigeNaam = name || voornaam;
  const hashed = password ? await bcrypt.hash(password, 12) : null;
  const user = await prisma.user.create({
    data: { voornaam, achternaam: achternaam ?? "", name: volledigeNaam, email, password: hashed, role, active: active ?? true },
  });

  const ip = getClientIp(req);

  await logAudit({
    actie: "GEBRUIKER_AANGEMAAKT",
    userId: session!.user.id,
    ip,
    detail: `nieuwe gebruiker: ${user.email}`,
  });

  let uitnodigingMislukt = false;
  if (!password) {
    const rawToken = await maakWachtwoordToken(user.id, UITNODIGING_GELDIGHEID_MINUTEN);
    const uitnodigingsUrl = `${req.nextUrl.origin}/wachtwoord-resetten?token=${rawToken}`;
    try {
      await verstuurUitnodigingsMail(user.email, volledigeNaam, uitnodigingsUrl);
      await logAudit({ actie: "GEBRUIKER_UITGENODIGD", userId: session!.user.id, ip, detail: `uitnodiging naar: ${user.email}` });
    } catch (err) {
      console.error("Versturen uitnodigingsmail mislukt:", err);
      uitnodigingMislukt = true;
    }
  }

  return NextResponse.json({ ...user, uitnodigingMislukt }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { denied, session } = await requireAdmin();
  if (denied) return denied;

  const { id, voornaam, achternaam, name, email, password, role, active } = await req.json();

  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  const data: Record<string, unknown> = { voornaam, achternaam, name, email, role, active };
  let wachtwoordGewijzigd = false;
  if (password) {
    const wwFout = valideerWachtwoord(password);
    if (wwFout) {
      return NextResponse.json({ error: wwFout }, { status: 400 });
    }
    data.password = await bcrypt.hash(password, 12);
    data.wachtwoordGewijzigdOp = new Date();
    data.mislukteInlogpogingen = 0;
    data.inlogGeblokkeerdTot = null;
    wachtwoordGewijzigd = true;
  }

  const user = await prisma.user.update({ where: { id }, data });

  await logAudit({
    actie: "GEBRUIKER_GEWIJZIGD",
    userId: session!.user.id,
    ip: getClientIp(req),
    detail: `gebruiker: ${user.email}${wachtwoordGewijzigd ? " (incl. wachtwoord)" : ""}`,
  });

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest) {
  const { denied, session } = await requireAdmin();
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Geen ID opgegeven." }, { status: 400 });

  const verwijderd = await prisma.user.delete({ where: { id } });

  await logAudit({
    actie: "GEBRUIKER_VERWIJDERD",
    userId: session!.user.id,
    ip: getClientIp(req),
    detail: `gebruiker: ${verwijderd.email}`,
  });

  return NextResponse.json({ ok: true });
}
