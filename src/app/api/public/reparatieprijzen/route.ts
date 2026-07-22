import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function geldigeApiKey(req: NextRequest): boolean {
  const verwacht = process.env.REPARATIEPRIJZEN_API_KEY;
  if (!verwacht) return false;

  const meegestuurd = req.headers.get("x-api-key") ?? "";
  const a = Buffer.from(meegestuurd);
  const b = Buffer.from(verwacht);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!geldigeApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const merken = await prisma.reparatieMerk.findMany({
    orderBy: { volgorde: "asc" },
    include: {
      modellen: {
        orderBy: { volgorde: "asc" },
        include: {
          items: { orderBy: [{ cat: "asc" }, { id: "asc" }] },
        },
      },
    },
  });

  const data = merken
    .filter(merk => merk.modellen.some(m => m.items.length > 0))
    .map(merk => ({
      key: merk.key,
      label: merk.label,
      modellen: merk.modellen
        .filter(model => model.items.length > 0)
        .map(model => ({
          key: model.modelKey,
          label: model.label,
          groep: model.groep,
          reparaties: model.items.map(item => ({
            categorie: item.cat,
            naam: item.naam,
            prijs: item.prijs,
          })),
        })),
    }));

  return NextResponse.json(
    { bijgewerkt: new Date().toISOString(), merken: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
